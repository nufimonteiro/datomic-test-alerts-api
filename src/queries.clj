(ns queries
  (:require [datomic.client.api :as d]))
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