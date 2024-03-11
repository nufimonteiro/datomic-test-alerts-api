(ns db-conn
  (:require
    [datomic.ion :as ion]
    [datomic.client.api :as d]
    [utils.general :as utils]
    [config :refer [datomic-arg-map]]))

(def db-name (or (:db-name (ion/get-env)) "automated-metrics"))

(def client (memoize #(d/client datomic-arg-map)))

(defn db-conn []
  (utils/with-retry #(d/connect (client) {:db-name db-name})))
