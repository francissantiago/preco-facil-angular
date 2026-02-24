# Preço Fácil - Calculadora para Freelancers

Preço Fácil é um aplicativo PWA/Mobile desenvolvido com **Ionic** e **Angular** para ajudar freelancers e empreendedores a precificarem seus serviços de forma justa e profissional.

## 🚀 Funcionalidades

O aplicativo guia o usuário através de 3 etapas simples:

1.  **Meu Valor (Configuração)**: Define o valor da sua hora técnica com base na meta salarial, custos fixos e horas trabalhadas.
2.  **Meus Custos (Materiais)**: Cadastro de custos recorrentes ou materiais (ex: Software, Hospedagem, Insumos).
3.  **Orçamento (Calculadora)**: Cria orçamentos detalhados somando horas + materiais + margem de lucro, gerando um preço final sugerido e link para envio no WhatsApp.

## 🛠 Arquitetura

O projeto segue uma arquitetura limpa e reativa:

-   **Frontend**: Angular 19+ com Standalone Components.
-   **UI Framework**: Ionic 8.
-   **Persistência**: `localStorage` (pode ser migrado para SQLite via Ionic Storage).
-   **Gerenciamento de Estado**: `BehaviorSubject` (RxJS) em um `DataService` centralizado.
-   **Modelos**: Interfaces TypeScript rigorosas para `ConfiguracaoBase`, `Material`, e `Orcamento`.

### Estrutura de Pastas

-   `src/app/models`: Interfaces de dados.
-   `src/app/services`: Lógica de negócios e persistência (`DataService`).
-   `src/app/tab1`: Página de Configuração do Valor Hora.
-   `src/app/tab2`: CRUD de Materiais/Custos.
-   `src/app/tab3`: Calculadora de Orçamentos.

## 📦 Como Compilar e Rodar

### Pré-requisitos

-   Node.js (v18+)
-   NPM
-   Ionic CLI (`npm install -g @ionic/cli`)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/preco-facil-angular.git
    cd preco-facil-angular
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

### Rodar Localmente (Desenvolvimento)

```bash
ionic serve
```
O app abrirá em `http://localhost:8100`.

### Compilar para Produção (PWA)

```bash
ionic build --prod
```
Os arquivos estarão na pasta `www/`.

### Compilar para Android

```bash
ionic cap add android
ionic cap sync
ionic cap open android
```

## 🤝 Contribuição

Este projeto é Open Source! Sinta-se à vontade para abrir Issues e Pull Requests.

## 📄 Licença

MIT
