const Param = require('../models/param')
const geradorUtilTest = require('./gerador-util-test')

const nomeProjeto = 'foo'
let git, gerador, params = {}

describe('test gerais', () => {

    beforeEach(async () => {

        geradorUtilTest.removerDiretorioTest()

        git = await geradorUtilTest.criarRepo(nomeProjeto)
        gerador = require('../lib/gerador')

        params = new Param({
            autor: "fulano",
            projeto: [
                geradorUtilTest.pathTest() + "/" + nomeProjeto
            ],
            task: ["1111111"],
            mostrarNumModificacao: true,
            mostrarDeletados: true
        })
    })

    it('test parâmetros inválidos', () => {

        // const req = {
        //     diretorio: "/home/foo/Documents/gerador-lista-artefato-qas/test/gerador-lista-artefato-qas",
        //     autor: "fulano",
        //     projeto: ["apc-estatico", "crm-patrimonio-estatico"],
        //     task: ["1199211", "1203082", "1203670", "1207175", "1210684", "1210658", "1212262", "1212444"]
        // }
    });

    ('teste de listagem de artefatos com projeto inválido', () => {

        const paramsError = new Param({
            autor: "fulano",
            projeto: ["bar"],
            task: ["1111111"]
        })

        expect.assertions(1);
        return expect(gerador(paramsError).gerarListaArtefato()).rejects.toEqual(
            new Error('Projeto \'' + paramsError.projeto[0] + '\' não encontrado'));
    });

    it('teste de listagem de artefatos renomeados', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            { origem: '1111111', destino: '1111111' },
            { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' }, 'R')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoQux.txt', 'M')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
        expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(3)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoQux.txt')

        expect(lista[0].listaArtefatoSaida[1].tipoAlteracao).toBe('M')
        expect(lista[0].listaArtefatoSaida[1].numeroAlteracao).toBe(2)
        expect(lista[0].listaArtefatoSaida[1].nomeArtefato).toBe('foo/arquivoQux.txt')

        expect(lista[0].listaArtefatoSaida[2].tipoAlteracao).toBe('R')
        expect(lista[0].listaArtefatoSaida[2].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[2].nomeArtefato).toBe('foo/arquivoQux.txt')
        expect(lista[0].listaArtefatoSaida[2].nomeAntigoArtefato).toBe('foo/arquivoFoo.txt')
        expect(lista[0].listaArtefatoSaida[2].nomeNovoArtefato).toBe('foo/arquivoQux.txt')
    })

    it('teste de listagem de artefatos renomeados 2 vezes', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            { origem: '1111111', destino: '1111111' },
            { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' }, 'R')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoQux.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            { origem: '1111111', destino: '1111111' },
            { origem: 'arquivoQux.txt', destino: 'arquivoBar.txt' }, 'R')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
        expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(3)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoBar.txt')

        expect(lista[0].listaArtefatoSaida[1].tipoAlteracao).toBe('M')
        expect(lista[0].listaArtefatoSaida[1].numeroAlteracao).toBe(3)
        expect(lista[0].listaArtefatoSaida[1].nomeArtefato).toBe('foo/arquivoBar.txt')

        expect(lista[0].listaArtefatoSaida[2].tipoAlteracao).toBe('R')
        expect(lista[0].listaArtefatoSaida[2].numeroAlteracao).toBe(2)
        expect(lista[0].listaArtefatoSaida[2].nomeArtefato).toBe('foo/arquivoBar.txt')
        expect(lista[0].listaArtefatoSaida[2].nomeAntigoArtefato).toBe('foo/arquivoQux.txt')
        expect(lista[0].listaArtefatoSaida[2].nomeNovoArtefato).toBe('foo/arquivoBar.txt')
    })

    it('teste de listagem de artefato A, R, D e A novamente', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            { origem: '1111111', destino: '1111111' },
            { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' }, 'R')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoQux.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            { origem: '1111111', destino: '1111111' },
            { origem: 'arquivoQux.txt', destino: 'arquivoBar.txt' }, 'R')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'D')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoFoo.txt', 'A')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
        expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(2)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('D')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoBar.txt')

        expect(lista[0].listaArtefatoSaida[1].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[1].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[1].nomeArtefato).toBe('foo/arquivoBar.txt')
    })

    it('teste de listagem de artefato A, M, D e A com mesmo nome, COM opção de mostrar deletados', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'D')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
        expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(2)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('D')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoBar.txt')

        expect(lista[0].listaArtefatoSaida[1].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[1].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[1].nomeArtefato).toBe('foo/arquivoBar.txt')
    })

    it('teste de listagem de artefato A, M, D e A com mesmo nome, SEM opção de mostrar deletados', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'D')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        params.mostrarDeletados = false

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(1)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoBar.txt')
    })

    it('teste de listagem de artefato A, M, D COM opção de mostrar deletados', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'D')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(1)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('D')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoBar.txt')
    })

    it('teste de listagem de artefato A, M, D SEM opção de mostrar deletados', async () => {

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'A')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'M')

        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto, '1111111',
            'arquivoBar.txt', 'D')

        params.mostrarDeletados = false

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(0)
    })

    it('teste de listagem de artefatos criados em branches diferentes', async () => {

        await geradorUtilTest.checkoutBranch(git, 'branchFoo')
        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            '1111111', 'arquivoFoo.txt', 'A')

        await geradorUtilTest.checkoutBranch(git, 'branchBar')
        await geradorUtilTest.manipularArquivoComCommit(git, nomeProjeto,
            '1111111', 'arquivoBar.txt', 'A')

        await geradorUtilTest.checkoutBranch(git, 'master')

        const lista = await gerador(params).gerarListaArtefato()

        expect(lista).toHaveLength(1)

        expect(lista[0].listaNumTarefaSaida).toHaveLength(1)
expect(lista[0].listaNumTarefaSaida[0]).toBe('1111111')

        expect(lista[0].listaArtefatoSaida).toHaveLength(2)

        expect(lista[0].listaArtefatoSaida[0].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[0].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[0].nomeArtefato).toBe('foo/arquivoFoo.txt')

        expect(lista[0].listaArtefatoSaida[1].tipoAlteracao).toBe('A')
        expect(lista[0].listaArtefatoSaida[1].numeroAlteracao).toBe(1)
        expect(lista[0].listaArtefatoSaida[1].nomeArtefato).toBe('foo/arquivoBar.txt')
    })
})