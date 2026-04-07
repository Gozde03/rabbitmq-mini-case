# RabbitMQ Mini Case

Bu proje, RabbitMQ kullanılarak hazırlanmış basit bir mesajlaşma örneğidir. Amaç; queue mantığını, RabbitMQ’nun temel çalışma yapısını ve Docker Compose ile servisleri local ortamda ayağa kaldırmaktır.

## Proje Yapısı

```txt
rabbitmq-mini-case/
  docker-compose.yml
  consumer/
    Dockerfile
    package.json
    package-lock.json
    index.js
  producer/
    package.json
    package-lock.json
    send.js
  README.md
```


## Çalıştırma

Proje kök dizininde:

```bash
docker compose up --build
```

Bu komut RabbitMQ ve consumer servisini başlatır.

RabbitMQ Management UI:

```txt
http://localhost:15672
```

Giriş bilgileri:

```txt
username: guest
password: guest
```

## Kuyruk Adı

```txt
mini-case-queue
```

## Mesaj Gönderme

Producer bağımlılıklarını kur:

```bash
cd producer
npm install
```

Mesaj gönder:

```bash
node send.js "Hello RabbitMQ"
```

Beklenen consumer çıktısı:

```txt
[Consumer] Received message: Hello RabbitMQ
```

## Management UI Üzerinden Manuel Mesaj Gönderme

1. `Queues and Streams` bölümüne girin.
2. `mini-case-queue` kuyruğunu açın.
3. `Publish message` alanından mesaj gönderin.

## Notlar

- Consumer, kuyruk yoksa otomatik olarak oluşturur.
- Mesajlar `ack` ile onaylanır.
- Kuyruk `durable`, mesajlar `persistent` olarak ayarlanmıştır.
- Producer bu case için localden çalıştırılmıştır.
- Consumer uygulamasında graceful shutdown desteği eklenmiştir. Böylece container durdurulduğunda bağlantı ve channel mümkün olduğunca kontrollü şekilde kapatılır.

## Örnek Çıktı

```txt
[Consumer] Waiting for messages in queue: mini-case-queue
[Consumer] Received message: Hello RabbitMQ
```