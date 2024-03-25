package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ecs"
	"github.com/aws/aws-sdk-go-v2/service/ecs/types"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/websocket"
)

type TranscodingJob struct {
	id int
	job string
}


type SubtitleJob struct {
	id int
	job string
}


var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}



func reader(conn *websocket.Conn) {
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		log.Println(string(p))
 
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}
	}
}


type clientConnectionsList struct {
	name string
	conn *websocket.Conn
}

var (
	clientConnections []clientConnectionsList
	mutex  sync.Mutex
)

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	queryParams := r.URL.Query()
	roomID := queryParams.Get("roomID")
	fmt.Println(roomID)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	obj := clientConnectionsList{
		name: roomID,
		conn: conn,
	}
	mutex.Lock()
	clientConnections = append(clientConnections, obj)
	fmt.Println(clientConnections)
	mutex.Unlock()
	run := true
	for run == true {
		_, _, err := conn.ReadMessage()
		fmt.Println("message read")
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
	}
}

func main() {
	go consumeKafkaMessages()
	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func consumeKafkaMessages() {
	topic := "mpmypepc-default"
	config := &kafka.ConfigMap{
		"metadata.broker.list":            "dory.srvs.cloudkafka.com:9094",
		"security.protocol":               "SASL_SSL",
		"sasl.mechanisms":                 "SCRAM-SHA-256",
		"sasl.username":                   "mpmypepc",
		"sasl.password":                   "CpU4icFaStnKJgX1uZCAQcgqHeP5g0RH",
		"group.id":                        "mpmypepc-default",
		"go.events.channel.enable":        true,
		"go.application.rebalance.enable": true,
		"default.topic.config":            kafka.ConfigMap{"auto.offset.reset": "earliest"},
		"bootstrap.servers":               "dory.srvs.cloudkafka.com:9094",
	}

	c, err := kafka.NewConsumer(config)
	if err != nil {
		fmt.Printf("Error creating Kafka consumer: %v\n", err)
		return
	}
	defer c.Close()
	sigchan := make(chan os.Signal, 1)
	c.SubscribeTopics([]string{topic}, nil)

	for {
		select {
		case sig := <-sigchan:
			fmt.Printf("Caught signal %v: terminating\n", sig)
			return
		case ev := <-c.Events():
			switch e := ev.(type) {
			case kafka.AssignedPartitions:
				c.Assign(e.Partitions)
			case kafka.RevokedPartitions:
				c.Unassign()
			case *kafka.Message:
				fmt.Printf("%% Message on %s: %s\n", e.TopicPartition, string(e.Value))
				for _, conn := range clientConnections {
					mutex.Lock()
					if conn.name == strings.Split(string(e.Value), ":::")[0] {
						err := conn.conn.WriteMessage(websocket.TextMessage, e.Value)
						if err != nil {
							fmt.Println("Error writing message to WebSocket:", err)
						}
					}
					mutex.Unlock()
				}
			case kafka.PartitionEOF:
				fmt.Printf("%% Reached %v\n", e)
			case kafka.Error:
				fmt.Fprintf(os.Stderr, "%% Error: %v\n", e)
			}
		}
	}
}


func slashRoute(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin","*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

type RequestBody struct {
    url   string `json:"url"`
   	email string `json:"email"`
}

func setupRoutes() {
	http.HandleFunc("/", wsEndpoint)
	http.HandleFunc("/test", slashRoute)
	http.HandleFunc("/runner/transcoding", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin","*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if (req.Method == "POST") {
			body, _ := ioutil.ReadAll(req.Body)
			type Data struct {
				URL   string `json:"url"`
				Email string `json:"email"`
			}
			var data Data
			err := json.Unmarshal([]byte(string(body)), &data)
			if err != nil {
				fmt.Println("Error parsing JSON:", err)
				return
			}
			_, err = config.LoadDefaultConfig(context.TODO())
			if err != nil {
				log.Fatal(err)
			}
			client := ecs.New(ecs.Options{
				Region:      "us-east-1",
				Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider("", "", "")),
			})

			params := &ecs.RunTaskInput{
					Cluster: aws.String("arn:aws:ecs:us-east-1:208806971401:cluster/vodio-cluster"),
					TaskDefinition: aws.String("arn:aws:ecs:us-east-1:208806971401:task-definition/vodio-transcode:1"),
					LaunchType: "FARGATE",
					Count: aws.Int32(1),
					NetworkConfiguration: &types.NetworkConfiguration{
						AwsvpcConfiguration: &types.AwsVpcConfiguration{
							Subnets: []string{"subnet-0dc852e023d6f0991", "subnet-0c61ae33d6c7a7e5a", "subnet-0baa870e232827ca4", "subnet-0b2b86eb36fa33e78", "subnet-087fdee6f2b4fabe4", "subnet-06ce439b118d38860"},
							SecurityGroups: []string{"sg-0af6b3453c5fe35c8"},
							AssignPublicIp: "ENABLED",
						},
					},
					Overrides: &types.TaskOverride{
						ContainerOverrides: []types.ContainerOverride{
							{
								Environment: []types.KeyValuePair{
									{
										Name: aws.String("URL"),
										Value: aws.String(data.URL),
									},
									{
										Name: aws.String("EMAIL"),
										Value: aws.String(data.Email),
									},
								},
								Name: aws.String("vodio-task"),
							},
						},
					},
				}	
				b, err := client.RunTask(context.TODO(), params)
				fmt.Println(b)
				fmt.Println(err)
				w.WriteHeader(http.StatusOK)
		}
	})
}

