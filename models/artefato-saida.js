const ArtefatoSaida = function ({
    nomeArtefato,
    nomeNovoArtefato,
    nomeAntigoArtefato,
    tipoAlteracao,
    numeroAlteracao,
    hash,
}) {
    this.nomeArtefato = nomeArtefato
    this.nomeNovoArtefato = nomeNovoArtefato
    this.nomeAntigoArtefato = nomeAntigoArtefato
    this.tipoAlteracao = tipoAlteracao
    this.numeroAlteracao = numeroAlteracao
    this.hash = hash

    return this
}

module.exports = ArtefatoSaida