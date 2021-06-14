const { TIPO_MODIFICACAO } = require('../lib/constants')

const Commit = function (arquivo, numeroTarefa, descricaoTarefa, hash, linhaArquivo) {

    this.numeroTarefa = numeroTarefa
    this.descricaoTarefa = descricaoTarefa
    this.tipoAlteracao = linhaArquivo.match(/^\w{1}/g)[0]
    this.hash = hash

    this.isTipoAlteracaoModificacao = () => this.tipoAlteracao === TIPO_MODIFICACAO.MODIFIED
    this.isTipoAlteracaoDelecao = () => this.tipoAlteracao === TIPO_MODIFICACAO.DELETED
    this.isTipoAlteracaoRenomear = () => this.tipoAlteracao === TIPO_MODIFICACAO.RENAMED
    this.isTipoAlteracaoAdicionar = () => this.tipoAlteracao === TIPO_MODIFICACAO.ADDED

    if (this.isTipoAlteracaoRenomear()) {

        this.nomeAntigoArquivo = arquivo.nomeArquivo
        this.nomeNovoArquivo = linhaArquivo.match(/[^\s]*.[^\r]$/g)[0]
            .replace(/^/g, arquivo.nomeProjeto + '/').trim()
    }

    return this
}

module.exports = Commit