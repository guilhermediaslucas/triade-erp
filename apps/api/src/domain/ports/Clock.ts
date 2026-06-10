// Porta de tempo. O dominio NUNCA usa `new Date()` solto.
// Toda data nasce daqui, sempre em UTC.
export interface Clock {
  /** Instante atual em UTC. */
  agora(): Date;
}
