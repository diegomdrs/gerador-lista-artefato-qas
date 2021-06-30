const path = require('path')
const fs = require('fs-extra')

const autor = 'fulano'
const GeradorTestUtil = require('./gerador-test-util')

const caminho = ['/tmp/gerador-lista-artefato']
let diretorio = {}

// node_modules/jest/bin/jest.js --runInBand --verbose test/diretorio.test.js 
// jest --runInBand --verbose test/diretorio.test.js 
describe('test gerais', () => {

    it('teste diretorio', async () => {

        const gitBar = await new GeradorTestUtil('bar', autor)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminho + '/bar')

        gitBar.removerDiretorioProjeto()
    })

    it('teste listar sub-diretorios primeiro nivel', async () => {

        const gitFoo = await new GeradorTestUtil('foo', autor)
        const gitBar = await new GeradorTestUtil('bar', autor)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminho + '/bar')
        expect(lista[1]).toBe(caminho + '/foo')

        gitFoo.removerDiretorioProjeto()
        gitBar.removerDiretorioProjeto()
    })

    it('teste listar sub-diretorios segundo nivel', async () => {

        const caminhoSegundoNivel = 'foo'

        const gitFoo = await new GeradorTestUtil(
            caminhoSegundoNivel + path.sep + 'foo', autor)
        const gitBar = await new GeradorTestUtil(
            caminhoSegundoNivel + path.sep + 'bar', autor)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminho + '/foo/bar')
        expect(lista[1]).toBe(caminho + '/foo/foo')

        gitFoo.removerDiretorioProjeto()
        gitBar.removerDiretorioProjeto()
    })

    it('teste listar sub-diretorios primeiro e segundo nivel', async () => {

        const caminhoSegundoNivel = 'foo'

        const gitFoo = await new GeradorTestUtil('bar', autor)
        const gitBar = await new GeradorTestUtil(
            caminhoSegundoNivel + path.sep + 'foo', autor)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminho + '/bar')
        expect(lista[1]).toBe(caminho + '/foo/foo')

        gitFoo.removerDiretorioProjeto()
        gitBar.removerDiretorioProjeto()
    })

    it('teste listar sub-diretorios até o quinto nível', async () => {

        const caminhoSegundoNivel = 'foo'
        const caminhoTerceiroNivel = 'bar' + path.sep + 'qux'
        const caminhoQuartoNivel = 'baz' + path.sep + 'foobar' + path.sep + 'waldo'
        const caminhoQuintoNivel = 'quuz' + path.sep + 'fred' + path.sep + 'flob'

        const gitBar = await new GeradorTestUtil('bar', autor)
        const gitFoo = await new GeradorTestUtil(caminhoSegundoNivel + path.sep + 'foo', autor)
        const gitBaz = await new GeradorTestUtil(caminhoTerceiroNivel + path.sep + 'baz', autor)
        const gitQux = await new GeradorTestUtil(caminhoQuartoNivel + path.sep + 'qux', autor)
        const gitThu = await new GeradorTestUtil(caminhoQuintoNivel + path.sep + 'thu', autor)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminho + '/bar')
        expect(lista[1]).toBe(caminho + '/bar/qux/baz')
        expect(lista[2]).toBe(caminho + '/baz/foobar/waldo/qux')
        expect(lista[3]).toBe(caminho + '/foo/foo')
        expect(lista[4]).toBe(caminho + '/quuz/fred/flob/thu')

        gitBar.removerDiretorioProjeto()
        gitFoo.removerDiretorioProjeto()
        gitBaz.removerDiretorioProjeto()
        gitQux.removerDiretorioProjeto()
        gitThu.removerDiretorioProjeto()
    })

    it('teste diretorio invalido', async () => {

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista).toEqual([])
    })

    it('teste diretorio com sub diretorio sem permissao de leitura no primeiro nivel', async () => {

        const gitFoo = await new GeradorTestUtil('foo', autor)

        const caminhoSemAcesso = caminho + path.sep + 'foo' + path.sep + 'bar'

        fs.mkdirsSync(caminhoSemAcesso); fs.chmodSync(caminhoSemAcesso, 0o000)

        diretorio = require('../lib/diretorio')(caminho)

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe('/tmp/gerador-lista-artefato/foo')

        gitFoo.removerDiretorioProjeto()
    })

    it('teste listar com dois caminhos', async () => {

        const caminhoFoo = caminho + path.sep + 'foo'
        const caminhoBar = caminho + path.sep + 'bar'
        const caminhoBaz = caminhoBar + path.sep + 'baz'
        const caminhoQux = caminhoBaz + path.sep + 'qux'

        const gitBar = await new GeradorTestUtil('foo', autor)
        const gitFoo = await new GeradorTestUtil('bar', autor)

        gitBaz = await new GeradorTestUtil('bar' + path.sep + 'baz', autor)
        gitQux = await new GeradorTestUtil('bar' + path.sep + 'baz' + path.sep + 'qux', autor)

        diretorio = require('../lib/diretorio')([
            caminhoFoo,
            caminhoBar
        ])

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminhoFoo)
        expect(lista[1]).toBe(caminhoBar)
        expect(lista[2]).toBe(caminhoBaz)
        expect(lista[3]).toBe(caminhoQux)

        gitBar.removerDiretorioProjeto()
        gitFoo.removerDiretorioProjeto()
    })

    it('teste listar com dois caminhos: um git repo e outro não', async () => {

        const caminhoFoo = caminho + path.sep + 'foo'
        const caminhoBar = caminho + path.sep + 'bar'

        const gitBar = await new GeradorTestUtil('bar', autor)

        diretorio = require('../lib/diretorio')([
            caminhoFoo, caminhoBar
        ])

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminhoBar)

        gitBar.removerDiretorioProjeto()
    })

    it('teste listar com dois caminhos invalidos', async () => {

        const caminhoFoo = caminho + path.sep + 'foo'

        diretorio = require('../lib/diretorio')([
            caminhoFoo, caminhoFoo, caminhoFoo, caminhoFoo
        ])

        const lista = await diretorio.listarDiretorio()

        expect(lista).toEqual([])
    })

    it('teste listar com caminhos repetidos', async () => {

        const caminhoFoo = caminho + path.sep + 'foo'

        const gitFoo = await new GeradorTestUtil('foo', autor)

        diretorio = require('../lib/diretorio')([
            caminhoFoo, caminhoFoo, caminhoFoo, caminhoFoo
        ])

        const lista = await diretorio.listarDiretorio()

        expect(lista[0]).toBe(caminhoFoo)

        gitFoo.removerDiretorioProjeto()
    })

    afterEach(async () => {
        (await new GeradorTestUtil('', '')).removerDiretorioTest()
    })
})