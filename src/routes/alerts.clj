(ns routes.alerts
  (:require
    [middleware.inject-datomic :refer [inject-datomic-mw]]
    [clojure.data.json :as json]
    [utils.general :as utils]
    [clj-http.client :as client]
    [resources.vars :as vars]))

(defn alerts-system-automator
  [{:keys [datomic query-params]}]
  (let [db (:db datomic)
        log (json/read-str (get query-params "log") :key-fn keyword)
        log-map (utils/log-string-to-map log)
        version (:version log-map)
        log-group (get query-params "loggroup")
        log-name (get query-params "logname")
        time (get query-params "time")
        message (get query-params "message")
        channel (get query-params "channel")
        timestamp-start (get query-params "timestampstart")
        timestamp-end (get query-params "timestampend")
        authorization (get query-params "authorization")]
    (println "Query-params from API: " query-params)
    (try (client/post vars/url-post-slack
                  {:form-params {:channel channel,
                                 ;:text    (utils/format-alert time log-group log-name version message timestamp-start timestamp-end)}
                                 :text    (utils/format-alert time log-group log-name version message timestamp-start timestamp-end query-params)}
                   :headers     {"Authorization" (format "Bearer %s" authorization)}}
                  {:status 200
                   :body   (str "Alert sent to channel: " channel)})
         (catch Exception e
           {:status 500
            :body   (str "Error in the API. Data from request -> " query-params)}))))

(def routes
  (vec {"/alerts-system-automator" {:middleware [inject-datomic-mw]
                                    :post       alerts-system-automator}}))