(ns routes.alerts
  (:require
    [middleware.inject-datomic :refer [inject-datomic-mw]]
    [clojure.data.json :as json]
    [utils.general :as utils]))

(defn get-datomic-version
  [{:keys [datomic query-params form-params]}]
  (let [db (:db datomic)
        log (json/read-str (get query-params "log") :key-fn keyword)
        log-map (utils/log-string-to-map log)
        version (:version log-map)]

    {:status 200
     :body   (str "version-datomic -> " version)}))

(def routes
  (vec {"/datomic-version-system-automator" {:middleware [inject-datomic-mw]
                                             :post        get-datomic-version}}))