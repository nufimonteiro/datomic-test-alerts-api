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
        authorization (get query-params "authorization")]
    (client/post vars/url-post-slack
                 {:form-params {:channel channel,
                                :text    (utils/format-alert time log-group log-name version message)}
                  :headers     {"Authorization" (format "Bearer %s" authorization)}})
    {:status 200
     :body   (str "Alert sent to channel: " channel)}))

(def routes
  (vec {"/alerts-system-automator" {:middleware [inject-datomic-mw]
                                    :post       alerts-system-automator}}))