const path = require('path')
const Param = require('../models/param')

module.exports = async function (commander) {

    init()

    async function init() {

        try {
            commander.projeto = commander.projeto.map(function (nomeProjeto) {
                return path.join(commander.diretorio, nomeProjeto)
            })

            delete commander.diretorio

            const params = new Param(commander)

            const gerador = require('../lib/gerador')(params)
            const listaSaida = await gerador.gerarListaArtefato()
            const printer = require('../lib/printer')(params, listaSaida)

            printer.imprimirListaSaida(listaSaida)

        } catch ({ message }) {

            console.log(message)
        }
    }
}