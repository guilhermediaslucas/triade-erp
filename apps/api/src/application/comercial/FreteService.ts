import type { FreteConfig, FreteConfigRepository, FormaEntrega } from '../../domain/comercial/FreteConfig.js';
import { FORMAS_ENTREGA } from '../../domain/comercial/FreteConfig.js';
import { ErroAplicacao } from '../../domain/erros/ErroAplicacao.js';

export interface FreteCalculo { frete: number; distanciaKm: number | null; memo: string | null; }

// Distância "simulada" a partir do CEP — fallback determinístico quando não há
// Google Maps configurado. Mesmo CEP → mesma distância. Faixa ~3..20 km.
export function simularKm(cep: string | null | undefined): number {
  const digitos = String(cep ?? '').replace(/\D/g, '');
  if (!digitos) return 10;
  let soma = 0;
  for (const ch of digitos) soma += Number(ch);
  return 3 + (soma % 18);
}

// Distância real via Google Maps Distance Matrix. Retorna null se não houver
// chave (GOOGLE_MAPS_API_KEY) / origem, ou em qualquer falha (cai no fallback).
async function distanciaGoogleKm(origem: string, destino: string): Promise<number | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !origem.trim() || !destino.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric`
      + `&origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&key=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const j: any = await resp.json();
    const el = j?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== 'OK' || !el.distance) return null;
    return Math.round((el.distance.value / 1000) * 10) / 10;
  } catch { return null; }
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const txt = (v: any): string | null => (v != null && String(v).trim()) || null;

export class FreteService {
  constructor(private readonly config: FreteConfigRepository) {}

  obterConfig(schema: string): Promise<FreteConfig> { return this.config.obter(schema); }

  async salvarConfig(schema: string, e: any): Promise<FreteConfig> {
    const kmRate = Number(e?.kmRate);
    const minMotoboy = Number(e?.minMotoboy);
    if (!Number.isFinite(kmRate) || kmRate < 0) throw new ErroAplicacao('frete.km_rate_invalido', 400);
    if (!Number.isFinite(minMotoboy) || minMotoboy < 0) throw new ErroAplicacao('frete.min_invalido', 400);
    const c: FreteConfig = { kmRate: r2(kmRate), minMotoboy: r2(minMotoboy), cepOrigem: txt(e?.cepOrigem) };
    await this.config.salvar(schema, c);
    return c;
  }

  // Calcula o frete conforme a forma de entrega.
  // - retirada: 0
  // - motoboy: distância (Google Maps se configurado, senão estimada) × km_rate, com mínimo
  // - correios/transportadora: valor manual (>= 0)
  async calcular(schema: string, e: any): Promise<FreteCalculo> {
    const forma = String(e?.formaEntrega ?? 'retirada') as FormaEntrega;
    if (!FORMAS_ENTREGA.includes(forma)) throw new ErroAplicacao('frete.forma_invalida', 400);

    if (forma === 'retirada') return { frete: 0, distanciaKm: null, memo: null };

    if (forma === 'motoboy') {
      const cfg = await this.config.obter(schema);
      const destino = String(e?.cep ?? '');
      let km = simularKm(destino);
      let via = 'estimado';
      const g = await distanciaGoogleKm(cfg.cepOrigem ?? '', destino);
      if (g != null) { km = g; via = 'Google Maps'; }
      const bruto = r2(km * cfg.kmRate);
      const frete = Math.max(bruto, cfg.minMotoboy);
      const memo = `${km} km (${via}) × R$ ${cfg.kmRate.toFixed(2)} = R$ ${bruto.toFixed(2)} (mín R$ ${cfg.minMotoboy.toFixed(2)})`;
      return { frete: r2(frete), distanciaKm: km, memo };
    }

    const manual = Number(e?.freteManual);
    if (!Number.isFinite(manual) || manual < 0) throw new ErroAplicacao('frete.manual_invalido', 400);
    return { frete: r2(manual), distanciaKm: null, memo: null };
  }
}
