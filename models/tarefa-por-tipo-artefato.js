const { TIPO_MODIFICACAO } = require('../lib/constants')

const Tarefa = function ({
    numeroTarefa,
    descricaoTarefa,
    hash,
    tipoAlteracao,
    nomeAntigoArquivo,
    nomeNovoArquivo
}) {
    this.numeroTarefa = numeroTarefa
    this.descricaoTarefa = descricaoTarefa
    this.hash = hash
    this.tipoAlteracao = tipoAlteracao
    this.nomeAntigoArquivo = nomeAntigoArquivo
    this.nomeNovoArquivo = nomeNovoArquivo

    this.numeroAlteracao = 1

    this.isTipoAlteracaoModificacao = () => this.tipoAlteracao === TIPO_MODIFICACAO.MODIFIED
    this.isTipoAlteracaoDelecao = () => this.tipoAlteracao === TIPO_MODIFICACAO.DELETED
    this.isTipoAlteracaoRenomear = () => this.tipoAlteracao === TIPO_MODIFICACAO.RENAMED

    return this
}

module.exports = Tarefa