
const Commit = require('../models/commit')

const Arquivo = function (nomeProjeto, numeroTarefa, hash, descricaoTarefa, linhaArquivo) {

    this.nomeProjeto = nomeProjeto

    // Matches a group before the main expression without including it in the result
    this.nomeArquivo = linhaArquivo.match(/(?<=\s).*/g)[0]

    this.nomeArquivo = this.nomeArquivo.match(/^[^\s]*/g)[0]
        .replace(/^/g, this.nomeProjeto + '/')

    this.commit = new Commit(this, numeroTarefa, descricaoTarefa, hash, linhaArquivo)

    return this
}

module.exports = Arquivo