(ns routes.alerts
  (:require
    [middleware.inject-datomic :refer [inject-datomic-mw]]))

(defn get-datomic-version
  [{:keys [datomic query-params]}]
  (let [db (:db datomic)
        period (get query-params "period")
        date (get query-params "date")
        token (queries/get-token-app "matomo" db)]
    ;code here
    {:status 200
     :body   "It's ok. :)"}))

(def routes
  (vec {"/all-matomo-metrics"             {:middleware [inject-datomic-mw]
                                           :get        get-datomic-version}}))