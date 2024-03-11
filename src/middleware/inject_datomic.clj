(ns middleware.inject-datomic
  (:require
   [datomic.client.api :as d]
   [db-conn :refer [db-conn]]))

(defn get-db
  "This is used to allow easily overriding the injected db in tests."
  [db]
  db)

(def inject-datomic-mw
  {:name ::inject-datomic
   :summary "Inject a Datomic connection into the request as a value to key `:datomic`"
   :wrap (fn [handler]
           (fn [request]
             (let [conn (db-conn)
                   db (get-db (d/db conn))]
               (handler (assoc request :datomic {:conn conn :db db})))))})