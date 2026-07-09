# Trabalho — Simulador AWS (Floci): Amazon S3

## Serviço escolhido: Amazon S3 (Simple Storage Service)

---

## 1. Funcionalidade do serviço

O Amazon S3 é um serviço de **armazenamento de objetos** (object storage), pertencente à categoria PaaS/serverless da AWS. Diferente de um sistema de arquivos tradicional, ele organiza os dados em:

- **Buckets**: contêineres lógicos de nível superior, com nome globalmente único, associados a uma região.
- **Objetos**: os próprios arquivos (imagens, vídeos, backups, logs, etc.), identificados por uma *key* (caminho/nome) dentro de um bucket, acompanhados de metadados.

Principais funcionalidades:

- **Upload/Download** de objetos via API REST, CLI ou SDKs.
- **Alta durabilidade** (99.999999999% — "11 noves") através de replicação automática entre múltiplos discos/zonas de disponibilidade.
- **Classes de armazenamento** (Standard, Infrequent Access, Glacier etc.) para balancear custo x frequência de acesso.
- **Controle de acesso granular**: políticas de bucket, ACLs, integração com IAM.
- **Versionamento** de objetos.
- **Hospedagem de site estático** diretamente a partir de um bucket.
- **Ciclo de vida (lifecycle policies)**: transição/expiração automática de objetos antigos.
- **Criptografia** em repouso (SSE) e em trânsito (HTTPS).
- Escalabilidade praticamente ilimitada, sem necessidade de provisionar capacidade previamente (diferente de um disco de VM).

É um serviço totalmente gerenciado: o usuário não administra servidores, discos ou redundância — só usa a API.

---

## 2. Equivalentes em outros provedores

### PaaS (armazenamento de objetos gerenciado)

| Provedor | Serviço equivalente |
|---|---|
| **AWS** | Amazon S3 |
| **Google Cloud** | Google Cloud Storage (GCS) |
| **Microsoft Azure** | Azure Blob Storage |

Todos seguem o mesmo modelo conceitual (bucket/container + objeto/blob + key), API REST própria, e níveis de armazenamento (hot/cool/archive), com pequenas diferenças de nomenclatura e limites.

### IaaS (armazenamento de objetos em provedores de infraestrutura mais simples)

| Provedor | Serviço equivalente |
|---|---|
| **DigitalOcean** | Spaces (compatível com a API do S3) |
| **Linode (Akamai)** | Object Storage (também compatível com API S3) |
| **Vultr** | Object Storage (compatível com API S3) |

Um ponto interessante: a maioria dos provedores IaaS menores **não reimplementa uma API própria** — eles oferecem um serviço **compatível com a API do S3**, o que virou um padrão de fato da indústria. Isso significa que ferramentas e SDKs feitos para S3 (como `aws-sdk`, `boto3`, `mc` da MinIO) funcionam apontando para os endpoints desses provedores, trocando apenas a URL base e as credenciais.

---

## 3. Levantamento de custos aproximados

Valores aproximados (região `us-east-1` / referência 2025-2026, sujeitos a alteração):

| Provedor | Armazenamento (por GB/mês) | Transferência de saída (egress) | Requisições |
|---|---|---|---|
| **AWS S3 Standard** | ~US$ 0,023/GB | ~US$ 0,09/GB (após 100 GB grátis) | ~US$ 0,005 / 1000 PUT, ~US$ 0,0004 / 1000 GET |
| **Google Cloud Storage (Standard)** | ~US$ 0,020/GB | ~US$ 0,12/GB | valores semelhantes, cobrança por operação |
| **Azure Blob (Hot tier)** | ~US$ 0,018–0,021/GB | ~US$ 0,087/GB | cobrança por transação, similar |
| **DigitalOcean Spaces** | US$ 5/mês fixo (inclui 250 GB armazenamento + 1 TB transferência) | incluso no plano até o limite | sem cobrança extra por requisição |
| **Linode Object Storage** | US$ 5/mês fixo (250 GB + 1 TB transferência) | incluso até o limite | sem cobrança extra |
| **Vultr Object Storage** | US$ 5/mês fixo (250 GB + 1 TB transferência) | incluso até o limite | sem cobrança extra |

**Conclusão de custo**: os provedores IaaS (DigitalOcean, Linode, Vultr) usam um modelo **de preço fixo e previsível** (bom para projetos pequenos/médios com uso estável), enquanto AWS/GCP/Azure usam um modelo **pay-as-you-go granular** (mais vantajoso em escala muito grande, com desconto por volume, mas menos previsível e com cobrança de egress mais agressiva).

Para um projeto pequeno (~50 GB armazenados, baixo tráfego), o custo mensal fica na faixa de:
- AWS S3: ~US$ 1–3/mês (armazenamento) + variável de egress.
- DigitalOcean/Linode/Vultr: US$ 5/mês fixo, já cobrindo bem mais que o necessário.

---

## 4. Aplicação de demonstração

Foi criada uma aplicação simples em Node.js/Express (`demo-s3/`) que simula as operações essenciais do S3:

- Criar bucket
- Listar buckets
- Upload de objeto (arquivo) para um bucket
- Listar objetos de um bucket
- Download de objeto
- Remover objeto
- Remover bucket

A aplicação expõe uma API REST que segue o mesmo modelo mental do S3 (bucket + key) e inclui uma pequena interface web para testar as operações pelo navegador. Os objetos são persistidos no disco local (`storage/`), simulando o armazenamento durável do S3 em escala reduzida.

Ver instruções de execução em `demo-s3/README.md`.
