# Gerador de listagem de artefatos

App para listar os artefatos incluídos/alterados/renomeados para geração do QAS

## Pré-requisitos 

### Sistema

- Git versão mínima v2.17
- Navegador Firefox

### Git

- Executar o comando `git pull --all` antes de usar o script
- Não utilizar espaços nos nomes dos arquivos
- Configurar corretamente as variáveis do Git `user.name` e `user.email` com matrícula e email
- Utilizar o comando `git mv` para renomear os artefatos

## Download 

- [Linux](https://raw.githubusercontent.com/diegomdrs/gerador-lista-artefato-qas/master/dist/gerador-lista-artefato-qas-lin)

- [Windows](https://raw.githubusercontent.com/diegomdrs/gerador-lista-artefato-qas/master/dist/gerador-lista-artefato-qas-win.exe)

- [Mac](https://raw.githubusercontent.com/diegomdrs/gerador-lista-artefato-qas/master/dist/gerador-lista-artefato-qas-mac)

## Utilização

### Windows

Para utilizar o gerador na versão para Windows, baixe o executável e clique duas vezes no mesmo. Será aberto o endereço [http://localhost:3333/gerador](http://localhost:3333/gerador)

### Linux

Na primeira utilização da versão Linux, execute:

``` console
$ chmod +x gerador-lista-artefato-qas-lin
```
Em seguida, execute o comando:

``` console
$ ./gerador-lista-artefato-qas-lin
```
### Mac

Na primeira utilização da versão Mac, execute:

``` console
$ chmod +x gerador-lista-artefato-qas-mac
```
Em seguida, execute o comando:

``` console
$ ./gerador-lista-artefato-qas-mac
```
Em seguida, será aberto o endereço [http://localhost:3333/gerador](http://localhost:3333/gerador)

![Modo Web](web.png)

## Utilização do modo CLI

### Linux e Mac

``` console
$ ./gerador-lista-artefato-qas --diretorio=/kdi/git --projeto=foo-estatico,foo-api --autor=X1337 --task=900089,900081
```

### Windows

``` console
$ ./gerador-lista-artefato-qas.exe --diretorio=C:/kdi/git --projeto=foo-estatico,foo-api --autor=X1337 --task=900089,900081
```

### Parâmetros do modo CLI

``` console
  -s, --server               Inicia a versão server e ignora os outros parâmetros (default: true)
  -d, --diretorio <type>     Diretório raiz dos projetos Git
  -p, --projeto <type>       Lista de projetos Git (podem ser passados vários projetos separados por vírgula)
  -a, --autor <type>         Matrícula do autor dos commits
  -t, --task <type>          Lista de tarefas (podem ser passadas várias tarefas separadas por vírgula)
  -l, --listagem <type>      Tipo da listagem QAS ou OFMANAGER (Opcional) (default: "OFMANAGER")
  --mostrar-num-modificacao  Nº de modificações do artefato na tarefa ou tarefas (Opcional)
  --mostrar-deletados        Mostra artefatos deletados na tarefa (Opcional)
  --mostrar-renomeados       Mostra artefatos renomeados na tarefa (Opcional)
  --mostrar-commits-locais   Mostra commits remotos e locais (Opcional)
  -v, --version              Mostra a versão do programa
  -h, --help                 output usage information
```

### Saida do gerador em modo CLI

``` console
$ ./gerador-lista-artefato-qas --diretorio=/kdi/git --projeto=foo-estatico,foo-api --autor=X1337 --task=900089,900081 --mostrar-deletados --mostrar-num-modificacao --mostrar-deletados --mostrar-renomeados

Tarefa nº 900089

M   2   foo-api/src/main/java/br/com/foo/api/v1/foo/gateway/GatewayConsultarFoo.java
M   3   foo-api/src/main/java/br/com/foo/api/v1/foo/gateway/GatewayIncluirFoo.java
M   1   foo-estatico/Gruntfile.js
M   1   foo-estatico/karma.conf.js
M   1   foo-estatico/package.json

Tarefa nº 900089

A   1   foo-api/src/main/java/br/com/foo/api/v1/foo/gateway/GatewayIncluirFoo.java

Tarefa nº 900089

R   1   foo-estatico/foo.json foo-estatico/bar.json

Tarefa nº 900089

D   1   foo-estatico/src/app/spas/foo/detalha-foo.tpl.html

```
Onde:

- Ação executada no artefato ou na lista de artefatos - A (Added), M (Modified), R (Renamed) e D (Deleted)
- Nº de modificações do artefato na tarefa - se utilizado o parâmetro `--mostrar-num-modificacao`
- Caminho do artefato

### Exemplo de uso

``` console
$ ./gerador-lista-artefato-qas.exe --diretorio=C:/kdi/git --projeto=foo-estatico,foo-api --autor=X1337 --task=900077,900079

Tarefas nº 900077, 900079

M      foo-estatico/Gruntfile.js

Tarefa nº 900077

A      foo-estatico/src/app/spas/foo/inclusao-foo.tpl.html

Tarefa nº 900077

M      foo-estatico/src/app/spas/foo/inclusao-foo.tpl.html
M      foo-estatico/src/app/spas/foo/altera-foo.tpl.html

Tarefa nº 900079

M       foo-api/pom.xml
M       foo-api/operacoes.xml

```
