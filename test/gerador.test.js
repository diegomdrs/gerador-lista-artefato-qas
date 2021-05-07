const Param = require('../models/param')
const GeradorTestUtil = require('./gerador-test-util')

const nomeProjeto = 'foo'
const autor = 'fulano'

const Gerador = require('../lib/gerador')

describe('test gerais', () => {

    describe('test gerais', () => {

        let gerador, gitUtil, params = {}

        beforeEach(async () => {

            gerador = require('../lib/gerador-por-tipo-artefato')
            gitUtil = await new GeradorTestUtil(nomeProjeto, autor)

            params = new Param({
                autor: "fulano",
                listaProjeto: [
                    gitUtil.obterCaminhoProjeto()
                ],
                listaTarefa: ["1111111", "2222222"],
                mostrarNumModificacao: true,
                mostrarCommitsLocais: true,
                mostrarDeletados: true,
                mostrarRenomeados: true
            })

            gerador = new Gerador(params)
        })

        it('teste do modulo Param com parametros repetidos', () => {

            const params = new Param({
                autor: "fulano",
                listaProjeto: ["bar", "bar", "bar", "bar", "bar", "bar"],
                listaTarefa: ["1111111", "1111111", "1111111"]
            })

            expect(params.listaTarefa).toHaveLength(1)
            expect(params.listaTarefa[0]).toBe('1111111')

            expect(params.listaProjeto).toHaveLength(1)
            expect(params.listaProjeto[0]).toBe('bar')
        })

        it('teste de listagem de artefatos com projeto inválido', async () => {

            const paramsError = new Param({
                autor: "fulano",
                listaProjeto: ["qux"],
                listaTarefa: ["1111111"]
            })

            const gerador = new Gerador(paramsError)

            expect.assertions(1);
            expect(gerador.init()).rejects.toEqual(
                new Error(`Projeto ${paramsError.listaProjeto[0]} não encontrado`));
        })
    })

    afterAll(async () => {
        (await new GeradorTestUtil('', '')).removerDiretorioTest()
    })
})