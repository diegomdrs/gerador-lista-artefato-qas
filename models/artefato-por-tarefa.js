const { TIPO_MODIFICACAO } = require('../lib/constants')

const Artefato = function ({
    nomeArtefato,
    nomeNovoArtefato,
    nomeAntigoArtefato,
    tipoArtefato,
    nomeProjeto,
    tipoAlteracao,
    numeroAlteracao,
    hash
}) {
    this.nomeArtefato = nomeArtefato
    this.nomeNovoArtefato = nomeNovoArtefato
    this.nomeAntigoArtefato = nomeAntigoArtefato
    this.tipoArtefato = tipoArtefato
    this.nomeProjeto = nomeProjeto
    this.tipoAlteracao = tipoAlteracao
    this.numeroAlteracao = numeroAlteracao
    this.hash = hash

    this.isTipoAlteracaoModificacao = () => this.tipoAlteracao === TIPO_MODIFICACAO.MODIFIED
    this.isTipoAlteracaoDelecao = () => this.tipoAlteracao === TIPO_MODIFICACAO.DELETED
    this.isTipoAlteracaoRenomear = () => this.tipoAlteracao === TIPO_MODIFICACAO.RENAMED
    
    return this
}

module.exports = Artefato