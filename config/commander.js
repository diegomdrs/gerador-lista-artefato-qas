
const program = require('commander')
const package = require('../package.json')

program
    .description('Comando para listar os artefatos incluídos/alterados/renomeados para geração do orçamento de OF')
    .option('-s, --server', 'Inicia a versão server e ignora os outros parâmetros', true)
    .option('-d, --diretorio <type>', 'Diretório raiz dos projetos Git')
    .option('-p, --projeto <type>', 'Lista de projetos Git (podem ser passados vários projetos separados por vírgula)', commaSeparatedList)
    .option('-a, --autor <type>', 'Matrícula do autor dos commits')
    .option('-t, --task <type>', 'Lista de tarefas (podem ser passadas várias tarefas separadas por vírgula)', commaSeparatedList)
    .option('-l, --listagem <type>', 'Tipo da listagem POR_TIPO_ARTEFATO ou POR_TAREFA (Opcional)','OFMANAGER')
    .option('--mostrar-num-modificacao', 'Nº de modificações do artefato na tarefa ou tarefas (Opcional)')
    .option('--mostrar-deletados', 'Mostra artefatos deletados na tarefa (Opcional)')
    .option('--mostrar-renomeados', 'Mostra artefatos renomeados na tarefa (Opcional)')
    .option('--mostrar-commits-locais', 'Mostra commits remotos e locais (Opcional)')
    .version(package.version, '-v, --version', 'Mostra a versão do programa')

function commaSeparatedList(value, dummyPrevious) {
    return value.split(',');
}

program.parse(process.argv)

module.exports = program