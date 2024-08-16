* Comando para instalar as dependências do projeto: npm install

Plataforma de Criação de Enquetes

Ao entrar no site, as enquetes são listadas, a pessoa deslogada pode clicar na enquete pra visualizar uma enquete, mas só pode votar e criar enquetes caso se cadastre.

Cada usuário pode votar apenas uma vez em uma enquete, não podendo alterar seu voto

Após votar na enquete, a plataforma deve buscar os votos daquela enquete e distribuir exibindo umn gráfico de pizza conforme as opções da enquete

Os usuários não podem editar as enquetes, nem excluir alguma enquete

* Quando tiver no frontend, devo salvar o token de autentiação no localstorage, quando clicar no logout, esse token deve ser apagado, daí sempre que for necessário passar um token de autenticação, o front deve recorrer ao token armazenado no local storage

* Daí ainda no front, caso o usuário possua um token válido, deve aparecer o email do usuário logado, um botão para Sair, um botão para visualizar as enquetes daquele usuário e um botão para acompanhar as enquetes que esse usuário votou (exibindo as enquetes que o usuário está participando):
    - Email do Usuário
        - Minhas Enquetes
        - Minhas Votações
        - Sair

* Caso o usuário possua um token inválido, deve aparecer um botão pra entrar e um botão para cadastrar-se:
    - Entrar
    - Cadastrar-se