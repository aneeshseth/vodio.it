package main

import (
	"context"
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"os"
	"sync"
	"strings"
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
	transcoding_jobs := make(chan TranscodingJob)
	subtitle_jobs := make(chan SubtitleJob)
	go consumeKafkaMessages()
	setupRoutes(transcoding_jobs, subtitle_jobs, transcoding_jobs, subtitle_jobs)
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



func setupRoutes(transcoding_jobs chan<- TranscodingJob, subtitle_jobs chan<- SubtitleJob, transcoding_listener <-chan TranscodingJob, subtitle_listener <-chan SubtitleJob) {
	http.HandleFunc("/", wsEndpoint)
	http.HandleFunc("/test", slashRoute)
	http.HandleFunc("/runner/subtitles", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin","*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		s3 := rand.NewPCG(42, 1024)
		r3 := rand.New(s3)
		id := r3.IntN(100)


		_, err := config.LoadDefaultConfig(context.TODO())
		if err != nil {
			log.Fatal(err)
		}
		client := ecs.New(ecs.Options{
			Region:      "us-west-2",
			Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider("", "", "")),
		})
			params := &ecs.RunTaskInput{
				Cluster: aws.String(""),
				TaskDefinition: aws.String(""),
				LaunchType: "",
				Count: aws.Int32(1),
				NetworkConfiguration: &types.NetworkConfiguration{
					AwsvpcConfiguration: &types.AwsVpcConfiguration{
						Subnets: []string{""},
						AssignPublicIp: "",
						SecurityGroups: []string{""},
					},
				},
				Overrides: &types.TaskOverride{
					ContainerOverrides: []types.ContainerOverride{
						{
							Command: []string{""},
							Environment: []types.KeyValuePair{
								{
									Name: aws.String(""),
									Value: aws.String(""),
								},
							},
						},
					},
				},
			}	
			client.RunTask(context.TODO(), params)
			subtitle_jobs <- SubtitleJob{id, "subtitle"}
			go func() {
				for job := range subtitle_listener {
					fmt.Printf("Subtitle job completed: %+v\n", job)
				}
			}()
	})
	http.HandleFunc("/runner/transcoding", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin","*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		s3 := rand.NewPCG(42, 1024)
		r3 := rand.New(s3)
		id := r3.IntN(100)
		

		_, err := config.LoadDefaultConfig(context.TODO())
		if err != nil {
			log.Fatal(err)
		}
		client := ecs.New(ecs.Options{
			Region:      "us-west-2",
			Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider("", "", "")),
		})
			params := &ecs.RunTaskInput{
				Cluster: aws.String(""),
				TaskDefinition: aws.String(""),
				LaunchType: "",
				Count: aws.Int32(1),
				NetworkConfiguration: &types.NetworkConfiguration{
					AwsvpcConfiguration: &types.AwsVpcConfiguration{
						Subnets: []string{""},
						AssignPublicIp: "",
						SecurityGroups: []string{""},
					},
				},
				Overrides: &types.TaskOverride{
					ContainerOverrides: []types.ContainerOverride{
						{
							Command: []string{""},
							Environment: []types.KeyValuePair{
								{
									Name: aws.String(""),
									Value: aws.String(""),
								},
							},
						},
					},
				},
			}	
			client.RunTask(context.TODO(), params)
			transcoding_jobs <- TranscodingJob{id, "transcoding"}
			go func() {
				for job := range transcoding_listener {
					
					fmt.Printf("Transcoding job completed: %+v\n", job)
				}
			}()
	})
	
}

