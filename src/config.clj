(ns config)

(def region "us-east-1")
(def system "datomic-test-alerts")

(def dev-arg-map {:system system
                  :server-type :dev-local})

(def datomic-arg-map {:server-type :ion
                      :region region
                      :system system
                      :endpoint "https://aoqp5jrsxe.execute-api.us-east-1.amazonaws.com" ;ClientApiGatewayEndpoint
                      :creds-profile "bubbagumpshrimp"})
