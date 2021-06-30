const Param = require('../models/param')
const GeradorTestUtil = require('./gerador-test-util')

const { TIPO_MODIFICACAO } = require('../lib/constants')

const GeradorPorTarefa = require('../lib/gerador-por-tarefa')

const nomeProjeto = 'foo'
const autor = 'fulano'

let gerador = {}

describe('test gerais', () => {

    describe('', () => {

        let gitUtil, params = {}

        beforeEach(async () => {

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

            gerador = new GeradorPorTarefa(params)
        })

        it('teste de listagem de artefatos renomeados', async () => {

            await gitUtil.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'arquivoFoo.txt' }
            ])

            await gitUtil.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'arquivoFoo.txt' }
            ])

            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' },
                TIPO_MODIFICACAO.RENAMED
            )

            await gitUtil.manipularArquivoComCommit('2222222',
                'arquivoQux.txt', TIPO_MODIFICACAO.MODIFIED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(2)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoQux.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.RENAMED, 1, 'foo/arquivoQux.txt', 'foo/arquivoFoo.txt', 'foo/arquivoQux.txt')

            expect(lista[1].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[1].listaNumeroTarefaSaida[0].numeroTarefa).toBe('2222222')
            expect(lista[1].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[1].listaArtefatoSaida[0], TIPO_MODIFICACAO.MODIFIED, 1, 'foo/arquivoQux.txt')
        })

        it('teste de listagem de artefatos renomeados 2 vezes', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoFoo.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoFoo.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoQux.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoQux.txt', destino: 'arquivoBar.txt' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(3)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.RENAMED, 1, 'foo/arquivoBar.txt', 'foo/arquivoFoo.txt', 'foo/arquivoQux.txt')
            expectObj(lista[0].listaArtefatoSaida[2], TIPO_MODIFICACAO.RENAMED, 1, 'foo/arquivoBar.txt', 'foo/arquivoQux.txt', 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato A, R, D e A novamente', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoFoo.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoFoo.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoFoo.txt', destino: 'arquivoQux.txt' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoQux.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoQux.txt', destino: 'arquivoBar.txt' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoFoo.txt', TIPO_MODIFICACAO.ADDED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.DELETED, 1, 'foo/arquivoBar.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoFoo.txt')
        })

        it('teste de listagem de artefato A, M, D e A com mesmo nome, COM opção de mostrar deletados', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.DELETED, 1, 'foo/arquivoBar.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato A, M, D e A com mesmo nome, SEM opção de mostrar deletados', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            params.mostrarDeletados = false

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato A, M, D COM opção de mostrar deletados', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.DELETED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato A, M, D SEM opção de mostrar deletados', async () => {

            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)
            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            params.mostrarDeletados = false

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(0)
        })

        it('teste de listagem de artefato A, M, R, D SEM opção de mostrar deletados', async () => {

            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)
            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitUtil.manipularArquivoComCommit('1111111',
                { origem: 'arquivoBar.txt', destino: 'arquivoFoo.txt' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoFoo.txt', TIPO_MODIFICACAO.DELETED)

            params.mostrarDeletados = false

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(0)
        })

        it('teste de listagem de artefatos criados em branches diferentes', async () => {

            await gitUtil.checkoutBranch('branchFoo')
            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoFoo.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.checkoutBranch('branchBar')
            await gitUtil.manipularArquivoComCommit('1111111', 'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.checkoutBranch('master')

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoFoo.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefatos commitados de uma vez', async () => {

            await gitUtil.manipularListaArquivoComCommit('0000000', [
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/app/spas/inventario/bem-services.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'Gruntfile.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'spec/inclusao-foo-controllers-spec.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/app/spas/imovel/cadastro/alterar-imovel.tpl.html' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel-controllers.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel.tpl.html' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/app/spas/imovel/inclusao-foo/inclusao-foo-controllers.js' }
            ])

            await gitUtil.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'Gruntfile.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/cadastro/alterar-imovel.tpl.html' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel-controllers.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel.tpl.html' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/inclusao-foo/inclusao-foo-controllers.js' }
            ])

            await gitUtil.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel-controllers.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'src/app/spas/imovel/cadastro/cadastro-imovel.tpl.html' }
            ])

            await gitUtil.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'Gruntfile.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.MODIFIED, pathArquivo: 'spec/inclusao-foo-controllers-spec.js' },
                { tipoAlteracao: TIPO_MODIFICACAO.DELETED, pathArquivo: 'src/app/spas/inventario/bem-services.js' }
            ])

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(7)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.MODIFIED, 2, 'foo/Gruntfile.js')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.MODIFIED, 2, 'foo/src/app/spas/imovel/cadastro/cadastro-imovel-controllers.js')
            expectObj(lista[0].listaArtefatoSaida[2], TIPO_MODIFICACAO.MODIFIED, 1, 'foo/src/app/spas/imovel/inclusao-foo/inclusao-foo-controllers.js')
            expectObj(lista[0].listaArtefatoSaida[3], TIPO_MODIFICACAO.MODIFIED, 1, 'foo/spec/inclusao-foo-controllers-spec.js')
            expectObj(lista[0].listaArtefatoSaida[4], TIPO_MODIFICACAO.MODIFIED, 1, 'foo/src/app/spas/imovel/cadastro/alterar-imovel.tpl.html')
            expectObj(lista[0].listaArtefatoSaida[5], TIPO_MODIFICACAO.MODIFIED, 2, 'foo/src/app/spas/imovel/cadastro/cadastro-imovel.tpl.html')
            expectObj(lista[0].listaArtefatoSaida[6], TIPO_MODIFICACAO.DELETED, 1, 'foo/src/app/spas/inventario/bem-services.js')
        })

        it('teste ignorar stashes na listagem de artefatos', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoSemCommit(
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.stash()

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
        })

        it('teste ignorar commits locais na listagem de artefatos', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            params.mostrarCommitsLocais = false

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(0)
        })

        it('teste de listagem de artefato A e M mas mostrando somente A', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato A, M e D mas mostrando somente D', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'arquivoBar.txt', TIPO_MODIFICACAO.DELETED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(1)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.DELETED, 1, 'foo/arquivoBar.txt')
        })

        it('teste de listagem de artefato .gitignore', async () => {

            await gitUtil.manipularArquivoComCommit('1111111',
                '.jshintr', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('2222222',
                { origem: '.jshintr', destino: '.jshintrc' }, TIPO_MODIFICACAO.RENAMED)

            await gitUtil.manipularArquivoComCommit('1111111',
                'bar/.gitignor', TIPO_MODIFICACAO.ADDED)

            await gitUtil.manipularArquivoComCommit('2222222',
                { origem: 'bar/.gitignor', destino: 'bar/.gitignore' }, TIPO_MODIFICACAO.RENAMED)

            const lista = await gerador.gerarListaArtefato()

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/.jshintrc')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'foo/bar/.gitignore')

            expect(lista[1].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[1].listaNumeroTarefaSaida).toEqual(expect.arrayContaining([{numeroTarefa: '2222222', descricaoTarefa: 'commit'}]))
            expect(lista[1].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[1].listaArtefatoSaida[0], TIPO_MODIFICACAO.RENAMED, 1, 'foo/.jshintrc', 'foo/.jshintr', 'foo/.jshintrc')
            expectObj(lista[1].listaArtefatoSaida[1], TIPO_MODIFICACAO.RENAMED, 1, 'foo/bar/.gitignore', 'foo/bar/.gitignor', 'foo/bar/.gitignore')
        })

        afterEach(async () => {
            gitUtil.removerDiretorioProjeto()
        })
    })

    describe('', () => {

        /* 
        node app --diretorio=/tmp/gerador-lista-artefato --projeto=qux,baz --autor=fulano --task=1111111 --mostrar-num-modificacao --mostrar-deletados --mostrar-commits-locais
        */
        it('teste separar arquivos de projetos diferentes em linhas diferentes', async () => {

            const gitQux = await new GeradorTestUtil('qux', autor)
            const gitBaz = await new GeradorTestUtil('baz', autor)

            await gitQux.manipularArquivoComCommit('1111111', 'arquivoQux.txt', TIPO_MODIFICACAO.ADDED)
            await gitBaz.manipularArquivoComCommit('1111111', 'arquivoBaz.txt', TIPO_MODIFICACAO.ADDED)

            const params = new Param({
                autor: "fulano",
                listaProjeto: [
                    gitQux.obterCaminhoProjeto(),
                    gitBaz.obterCaminhoProjeto(),
                ],
                listaTarefa: ["1111111"],
                mostrarNumModificacao: true,
                mostrarCommitsLocais: true,
                mostrarDeletados: true,
                mostrarRenomeados: true
            })

            const lista = await new GeradorPorTarefa(params).gerarListaArtefato()

            expect(lista).toHaveLength(1)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida).toEqual(expect.arrayContaining([{numeroTarefa: '1111111', descricaoTarefa: 'commit'}]))
            expect(lista[0].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'qux/arquivoQux.txt')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'baz/arquivoBaz.txt')

            gitQux.removerDiretorioProjeto()
            gitBaz.removerDiretorioProjeto()
        })

        /* 
        node app --diretorio=/tmp/gerador-lista-artefato --projeto=abc,def,ghi --autor=fulano --task=1111111,2222222,3333333 --mostrar-num-modificacao --mostrar-deletados --mostrar-commits-locais
        */
        it('teste ordenação dos artefatos dentro da tarefa', async () => {

            const gitAbc = await new GeradorTestUtil('abc', autor)
            const gitDef = await new GeradorTestUtil('def', autor)
            const gitGhi = await new GeradorTestUtil('ghi', autor)

            await gitAbc.manipularArquivoComCommit('0000000', 'arquivoQux.txt', TIPO_MODIFICACAO.ADDED)
            await gitDef.manipularArquivoComCommit('0000000', 'arquivoBaz.txt', TIPO_MODIFICACAO.ADDED)
            await gitGhi.manipularArquivoComCommit('0000000', 'arquivoIhx.txt', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('0000000', 'arquivoFoo.txt', TIPO_MODIFICACAO.ADDED)
            await gitDef.manipularArquivoComCommit('0000000', 'arquivoBar.txt', TIPO_MODIFICACAO.ADDED)
            await gitGhi.manipularArquivoComCommit('0000000', 'arquivoTyu.txt', TIPO_MODIFICACAO.ADDED)

            await gitAbc.manipularArquivoComCommit('0000000', '.jshintr', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('0000000', 'karma-tpz.config.js', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('0000000', 'ArquivoTyuGateway.java', TIPO_MODIFICACAO.ADDED)

            await gitGhi.manipularArquivoComCommit('1111111', 'arquivoOux.txt', TIPO_MODIFICACAO.ADDED)
            await gitGhi.manipularArquivoComCommit('1111111', 'arquivoPty.txt', TIPO_MODIFICACAO.ADDED)
            await gitGhi.manipularArquivoComCommit('1111111', 'arquivoXvc.txt', TIPO_MODIFICACAO.ADDED)

            await gitAbc.manipularArquivoComCommit('1111111',
                { origem: '.jshintr', destino: '.jshintrc' }, TIPO_MODIFICACAO.RENAMED)

            await gitAbc.manipularArquivoComCommit('1111111', 'gruntfile-yuiq.js', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'ResourcearquivoRtu.java', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'arquivo-qux.css', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'arquivoPty.txt', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'ArquivoUpeGateway.java', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'ArquivoTyuGateway.java', TIPO_MODIFICACAO.DELETED)
            await gitAbc.manipularArquivoComCommit('1111111', 'arquivoPty.txt', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'ArquivoTyuResource.java', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'arquivo-qux-spec.js', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'karma-pty.config.js', TIPO_MODIFICACAO.ADDED)
            await gitAbc.manipularArquivoComCommit('1111111', 'karma-tpz.config.js', TIPO_MODIFICACAO.DELETED)
            await gitAbc.manipularArquivoComCommit('1111111', 'GatewayArquivoAqw.java', TIPO_MODIFICACAO.ADDED)

            await gitAbc.manipularArquivoComCommit('1111111',
                { origem: '.jshintrc', destino: '.jshintrcplo' }, TIPO_MODIFICACAO.RENAMED)

            await gitGhi.manipularArquivoComCommit('1111111', 'arquivoIhx.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitAbc.manipularArquivoComCommit('1111111', 'arquivoFoo.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitDef.manipularArquivoComCommit('1111111', 'arquivoBaz.txt', TIPO_MODIFICACAO.MODIFIED)

            await gitAbc.manipularArquivoComCommit('2222222', 'arquivoFoo.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitAbc.manipularArquivoComCommit('2222222', 'arquivoFoo.txt', TIPO_MODIFICACAO.MODIFIED)
            await gitAbc.manipularArquivoComCommit('2222222', 'arquivo-qux.css', TIPO_MODIFICACAO.DELETED)

            const params = new Param({
                autor: "fulano",
                listaProjeto: [
                    gitAbc.obterCaminhoProjeto(),
                    gitDef.obterCaminhoProjeto(),
                    gitGhi.obterCaminhoProjeto(),
                ],
                listaTarefa: ["1111111", "2222222", "3333333"],
                mostrarNumModificacao: true,
                mostrarCommitsLocais: true,
                mostrarDeletados: true,
                mostrarRenomeados: true
            })

            const lista = await new GeradorPorTarefa(params).gerarListaArtefato()

            expect(lista).toHaveLength(2)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(18)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.RENAMED, 1, 'abc/.jshintrcplo', 'abc/.jshintr', 'abc/.jshintrc')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.RENAMED, 1, 'abc/.jshintrcplo', 'abc/.jshintrc', 'abc/.jshintrcplo')

            expectObj(lista[0].listaArtefatoSaida[2], TIPO_MODIFICACAO.ADDED, 1, 'abc/arquivo-qux-spec.js')
            expectObj(lista[0].listaArtefatoSaida[3], TIPO_MODIFICACAO.ADDED, 1, 'abc/arquivoPty.txt')
            expectObj(lista[0].listaArtefatoSaida[4], TIPO_MODIFICACAO.ADDED, 1, 'abc/gruntfile-yuiq.js')
            expectObj(lista[0].listaArtefatoSaida[5], TIPO_MODIFICACAO.ADDED, 1, 'abc/karma-pty.config.js')
            expectObj(lista[0].listaArtefatoSaida[6], TIPO_MODIFICACAO.ADDED, 1, 'abc/ResourcearquivoRtu.java')
            expectObj(lista[0].listaArtefatoSaida[7], TIPO_MODIFICACAO.ADDED, 1, 'abc/ArquivoTyuResource.java')
            expectObj(lista[0].listaArtefatoSaida[8], TIPO_MODIFICACAO.ADDED, 1, 'abc/ArquivoUpeGateway.java')
            expectObj(lista[0].listaArtefatoSaida[9], TIPO_MODIFICACAO.ADDED, 1, 'abc/GatewayArquivoAqw.java')

            expectObj(lista[0].listaArtefatoSaida[10], TIPO_MODIFICACAO.DELETED, 1, 'abc/karma-tpz.config.js')
            expectObj(lista[0].listaArtefatoSaida[11], TIPO_MODIFICACAO.DELETED, 1, 'abc/ArquivoTyuGateway.java')

            expectObj(lista[0].listaArtefatoSaida[12], TIPO_MODIFICACAO.MODIFIED, 1, 'abc/arquivoFoo.txt')
            expectObj(lista[0].listaArtefatoSaida[13], TIPO_MODIFICACAO.MODIFIED, 1, 'def/arquivoBaz.txt')
            expectObj(lista[0].listaArtefatoSaida[14], TIPO_MODIFICACAO.ADDED, 1, 'ghi/arquivoOux.txt')
            expectObj(lista[0].listaArtefatoSaida[15], TIPO_MODIFICACAO.ADDED, 1, 'ghi/arquivoPty.txt')
            expectObj(lista[0].listaArtefatoSaida[16], TIPO_MODIFICACAO.ADDED, 1, 'ghi/arquivoXvc.txt')
            expectObj(lista[0].listaArtefatoSaida[17], TIPO_MODIFICACAO.MODIFIED, 1, 'ghi/arquivoIhx.txt')

            expect(lista[1].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[1].listaNumeroTarefaSaida[0].numeroTarefa).toBe('2222222')
            expect(lista[1].listaArtefatoSaida).toHaveLength(2)

            expectObj(lista[1].listaArtefatoSaida[0], TIPO_MODIFICACAO.MODIFIED, 2, 'abc/arquivoFoo.txt')
            expectObj(lista[1].listaArtefatoSaida[1], TIPO_MODIFICACAO.DELETED, 1, 'abc/arquivo-qux.css')

            gitAbc.removerDiretorioProjeto()
            gitDef.removerDiretorioProjeto()
            gitGhi.removerDiretorioProjeto()
        })

        /*
        node app --diretorio=/tmp/gerador-lista-artefato --projeto=foo,bar --autor=fulano --task=1111111,2222222 --mostrar-num-modificacao --mostrar-deletados --mostrar-commits-locais --mostrar-renomeados
        */
        it('teste de listagem com arquivos com tipos diferentes separados', async () => {

            const gitFoo = await new GeradorTestUtil('foo', autor)
            const gitBar = await new GeradorTestUtil('bar', autor)

            const params = new Param({
                autor: "fulano",
                listaProjeto: [
                    gitFoo.obterCaminhoProjeto(),
                    gitBar.obterCaminhoProjeto(),
                ],
                listaTarefa: ["1111111", "2222222"],
                mostrarNumModificacao: true,
                mostrarCommitsLocais: true,
                mostrarDeletados: true,
                mostrarRenomeados: true
            })

            await gitFoo.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/main/java/br/com/foo/bar/api/v1/resource/BazResource.java' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/test/java/br/com/foo/bar/api/v1/resources/test/BazResourceTest.java' }
            ])

            await gitFoo.manipularListaArquivoComCommit('1111111', [
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/main/java/br/com/foo/bar/api/v1/resource/GatewayBar.java' },
                { tipoAlteracao: TIPO_MODIFICACAO.ADDED, pathArquivo: 'src/test/java/br/com/foo/bar/api/v1/resources/test/GatewayBarTest.java' }
            ])

            await gitFoo.manipularArquivoComCommit('1111111', 'karma.conf.js', TIPO_MODIFICACAO.ADDED)
            await gitFoo.manipularArquivoComCommit('1111111', 'Gruntfile.js', TIPO_MODIFICACAO.ADDED)

            // Projeto diferentes
            await gitFoo.manipularArquivoComCommit('1111111', 'src/app/spas/foo-controller.js', TIPO_MODIFICACAO.ADDED)
            await gitBar.manipularArquivoComCommit('1111111', 'src/app/spas/bar-controller.js', TIPO_MODIFICACAO.ADDED)

            // Adicionado e deletado
            await gitFoo.manipularArquivoComCommit('1111111', 'bar-controller.html', TIPO_MODIFICACAO.ADDED)
            await gitFoo.manipularArquivoComCommit('1111111', 'bar-controller.html', TIPO_MODIFICACAO.DELETED)

            // Sera considerado somente A na tarefa
            await gitFoo.manipularArquivoComCommit('1111111', 'foo-controller.html', TIPO_MODIFICACAO.ADDED)
            await gitFoo.manipularArquivoComCommit('1111111', 'foo-controller.html', TIPO_MODIFICACAO.MODIFIED)
            await gitFoo.manipularArquivoComCommit('1111111', 'foo-controller.html', TIPO_MODIFICACAO.MODIFIED)

            await gitFoo.manipularArquivoComCommit('2222222', 'foo-controller.html', TIPO_MODIFICACAO.MODIFIED)
            await gitFoo.manipularArquivoComCommit('2222222', 'foo-controller.html', TIPO_MODIFICACAO.MODIFIED)

            await gitBar.manipularArquivoComCommit('2222222', 'qux-controller.html', TIPO_MODIFICACAO.ADDED)
            await gitBar.manipularArquivoComCommit('2222222',
                { origem: 'qux-controller.html', destino: 'quy-controller.html' }, TIPO_MODIFICACAO.RENAMED)
            await gitBar.manipularArquivoComCommit('2222222',
                { origem: 'quy-controller.html', destino: 'quuz-controller.html' }, TIPO_MODIFICACAO.RENAMED)

            await gitBar.manipularArquivoComCommit('2222222', 'frzzy-controller.html', TIPO_MODIFICACAO.ADDED)
            await gitBar.manipularArquivoComCommit('2222222',
                { origem: 'frzzy-controller.html', destino: 'walzz-controller.html' }, TIPO_MODIFICACAO.RENAMED)
            await gitBar.manipularArquivoComCommit('2222222',
                { origem: 'walzz-controller.html', destino: 'yrizz-controller.html' }, TIPO_MODIFICACAO.RENAMED)

            const lista = await new GeradorPorTarefa(params).gerarListaArtefato()
            // require('../lib/printer')({ mostrarNumModificacao: true }, lista).imprimirListaSaida()

            expect(lista).toHaveLength(2)

            expect(lista[0].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[0].listaNumeroTarefaSaida[0].numeroTarefa).toBe('1111111')
            expect(lista[0].listaArtefatoSaida).toHaveLength(10)

            expectObj(lista[0].listaArtefatoSaida[0], TIPO_MODIFICACAO.ADDED, 1, 'foo/src/main/java/br/com/foo/bar/api/v1/resource/BazResource.java')
            expectObj(lista[0].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'foo/src/test/java/br/com/foo/bar/api/v1/resources/test/BazResourceTest.java')

            expectObj(lista[0].listaArtefatoSaida[4], TIPO_MODIFICACAO.ADDED, 1, 'foo/karma.conf.js')
            expectObj(lista[0].listaArtefatoSaida[5], TIPO_MODIFICACAO.ADDED, 1, 'foo/Gruntfile.js')

            expectObj(lista[0].listaArtefatoSaida[6], TIPO_MODIFICACAO.ADDED, 1, 'foo/src/app/spas/foo-controller.js')
            expectObj(lista[0].listaArtefatoSaida[7], TIPO_MODIFICACAO.ADDED, 1, 'foo/foo-controller.html')

            expectObj(lista[0].listaArtefatoSaida[8], TIPO_MODIFICACAO.DELETED, 1, 'foo/bar-controller.html')
            expectObj(lista[0].listaArtefatoSaida[9], TIPO_MODIFICACAO.ADDED, 1, 'bar/src/app/spas/bar-controller.js')

            expect(lista[1].listaNumeroTarefaSaida).toHaveLength(1)
            expect(lista[1].listaNumeroTarefaSaida[0].numeroTarefa).toBe('2222222')
            expect(lista[1].listaArtefatoSaida).toHaveLength(7)

            expectObj(lista[1].listaArtefatoSaida[0], TIPO_MODIFICACAO.MODIFIED, 2, 'foo/foo-controller.html')
            expectObj(lista[1].listaArtefatoSaida[1], TIPO_MODIFICACAO.ADDED, 1, 'bar/quuz-controller.html')
            expectObj(lista[1].listaArtefatoSaida[2], TIPO_MODIFICACAO.ADDED, 1, 'bar/yrizz-controller.html')
            expectObj(lista[1].listaArtefatoSaida[3], TIPO_MODIFICACAO.RENAMED, 1, 'bar/quuz-controller.html', 'bar/qux-controller.html', 'bar/quy-controller.html')
            expectObj(lista[1].listaArtefatoSaida[4], TIPO_MODIFICACAO.RENAMED, 1, 'bar/quuz-controller.html', 'bar/quy-controller.html', 'bar/quuz-controller.html')
            expectObj(lista[1].listaArtefatoSaida[5], TIPO_MODIFICACAO.RENAMED, 1, 'bar/yrizz-controller.html', 'bar/frzzy-controller.html', 'bar/walzz-controller.html')
            expectObj(lista[1].listaArtefatoSaida[6], TIPO_MODIFICACAO.RENAMED, 1, 'bar/yrizz-controller.html', 'bar/walzz-controller.html', 'bar/yrizz-controller.html')

            gitFoo.removerDiretorioProjeto()
            gitBar.removerDiretorioProjeto()
        })
    })

    afterEach(async () => {
        (await new GeradorTestUtil('', '')).removerDiretorioTest()
    })
})


function expectObj(artefato, tipoAlteracao, numeroAlteracao, nomeArtefato, nomeAntigoArtefato, nomeNovoArtefato) {
    expect(artefato).toMatchObject({
        tipoAlteracao: tipoAlteracao,
        numeroAlteracao: numeroAlteracao,
        nomeArtefato: nomeArtefato,
        nomeAntigoArtefato: nomeAntigoArtefato,
        nomeNovoArtefato: nomeNovoArtefato
    })
}