(ns config)

(def region "us-east-1")
(def system "datomic-metrics")

(def dev-arg-map {:system system
                  :server-type :dev-local})

(def datomic-arg-map {:server-type :ion
                      :region region
                      :system system
                      :endpoint "https://nvqvp7b27k.execute-api.us-east-1.amazonaws.com" ;ClientApiGatewayEndpoint
                      :creds-profile "bubbagumpshrimp"})
