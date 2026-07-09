# Demo — Object Storage estilo Amazon S3

Aplicação de demonstração para o trabalho sobre o serviço **S3** no simulador AWS/Floci.
Implementa uma API REST inspirada no modelo bucket/objeto do S3, com uma interface web simples,
armazenando os arquivos em disco local (`storage/`).

## Como rodar

```bash
cd demo-s3
npm install
npm start
```

Acesse http://localhost:3000

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| PUT | `/buckets/:bucket` | Cria um bucket |
| GET | `/buckets` | Lista buckets |
| DELETE | `/buckets/:bucket` | Remove um bucket vazio |
| PUT | `/buckets/:bucket/objects/:key` | Upload de objeto (multipart, campo `file`) |
| GET | `/buckets/:bucket/objects` | Lista objetos do bucket |
| GET | `/buckets/:bucket/objects/:key` | Download do objeto |
| DELETE | `/buckets/:bucket/objects/:key` | Remove o objeto |

## Exemplos via curl

```bash
# criar bucket
curl -X PUT http://localhost:3000/buckets/meu-bucket

# upload de arquivo
curl -X PUT -F "file=@./algum-arquivo.txt" http://localhost:3000/buckets/meu-bucket/objects/algum-arquivo.txt

# listar objetos
curl http://localhost:3000/buckets/meu-bucket/objects

# download
curl -O http://localhost:3000/buckets/meu-bucket/objects/algum-arquivo.txt

# remover objeto
curl -X DELETE http://localhost:3000/buckets/meu-bucket/objects/algum-arquivo.txt
```
