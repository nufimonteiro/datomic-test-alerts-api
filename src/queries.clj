(ns queries
  (:require [datomic.client.api :as d]))

(defn get-password-by-user
  [user db]
  (ffirst (d/q '[:find ?password
                 :in $ ?name
                 :where [?user :user/name ?name]
                 [?user :user/password ?password]] db user)))

(defn validate-login
  [user pass db]
  (ffirst (d/q '[:find ?name ?password
                 :in $ ?name ?password
                 :where [?user :user/name ?name]
                 [?user :user/password ?pass]
                 [(= ?pass ?password)]] db user pass)))



(defn search-password
  [password db]
  (ffirst (d/q '[:find ?password
                 :in $ ?pass
                 :where [?p :user/password ?pass]
                 [?p :user/password ?password]] db password)))

(defn get-token-app
  [application db]
  (ffirst (d/q '[:find ?application
                 :in $ ?app-name
                 :where [?app :token/application ?app-name]
                 [?app :token/value ?application]] db application)))