from flask import Flask, request

from confluent_kafka import Producer
import sys
import whisper

app = Flask(__name__)

@app.route('/process_and_send', methods=['POST'])
def process_and_send():
    data = request.get_json()
    model = whisper.load_model("base")
    result = model.transcribe(data["url"])
    print(result['text'])
    topic = ["mpmypepc-default"]
    conf = {
        'bootstrap.servers': 'dory.srvs.cloudkafka.com:9094',
        'session.timeout.ms': 6000,
        'default.topic.config': {'auto.offset.reset': 'smallest'},
        'security.protocol': 'SASL_SSL',
        'sasl.mechanisms': 'SCRAM-SHA-256',
        'sasl.username': "mpmypepc",
        'sasl.password': "CpU4icFaStnKJgX1uZCAQcgqHeP5g0RH"
    }
    p = Producer(**conf)
    def delivery_callback(err, msg):
        if err:
            sys.stderr.write('%% Message failed delivery: %s\n' % err)
        else:
            sys.stderr.write('%% Message delivered to %s [%d]\n' %
                             (msg.topic(), msg.partition()))

    p.produce(topic[0], f'{data["email"]}::: {result["text"]}', callback=delivery_callback)
    p.flush()

    return "Message sent successfully!"

if __name__ == '__main__':
    app.run(debug=True)
