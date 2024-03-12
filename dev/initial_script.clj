(ns initial-script
  (:require [datomic.client.api :as d]
            [clojure.tools.reader.edn :as edn]
            [config :refer [datomic-arg-map]]
            [queries :as queries]
            [pandect.algo.sha256 :as p])
  (:use clojure.pprint))

(def db-name "datomic-test-alerts")


;;config at src/config.clj
(def client
  (d/client
    datomic-arg-map))

;(d/create-database client {:db-name db-name})

;;test query/connection
(def conn (d/connect client {:db-name db-name}))

(def db (d/db conn))

(def user-schema
  [{:db/ident       :user/name
    :db/valueType   :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc         "A person's name"
    :db/noHistory   true}
   {:db/ident       :user/password
    :db/valueType   :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc         "Password in sha-256"
    :db/noHistory   true}])

(def token-schema
  [{:db/ident       :token/application
    :db/valueType   :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc         "Application token"
    :db/noHistory   true}
   {:db/ident       :token/value
    :db/valueType   :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc         "Token value"
    :db/noHistory   true}])

(d/transact conn {:tx-data user-schema})
(d/transact conn {:tx-data token-schema})


(d/transact conn {:tx-data [{:token/application "test-alerts"
                             :token/value       "DatomicTestAlerts!!"}]})
(ffirst (d/q '[:find ?application
        :in $ ?app-name
        :where [?app :token/application ?app-name]
        [?app :token/value ?application]] db "test-alerts"))

(utils.general/token-is-valid? "DatomicTestAlerts!!" db "test-alerts")
(p/sha256 "Datomic@9513Metrics!!")

(d/transact conn {:tx-data [{:user/name     "Admin"
                             :user/password "pass-here"}]})

(queries/get-password-by-user "Admin" db)


(queries/search-password "pass-here" db)

;get app
(ffirst (d/q '[:find ?application
               :in $ ?app-name
               :where [?app :token/application ?app-name]
               [?app :token/value ?application]] db "matomo"))

;get password
(ffirst (d/q '[:find ?password
               :where [?user :user/name "Admin"]
               [?user :user/password ?password]] db))

(ffirst (d/q {:query '[:find ?password
                       :where [?user :user/name "Admin"]
                       [?user :user/password ?password]]
              :args  [db]}))