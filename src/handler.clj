(ns handler
  (:require
    [muuntaja.core :as m]
    [reitit.ring :as ring]
    [reitit.ring.middleware.muuntaja :as muuntaja]
    [ring.middleware.params :as params]
    [middleware.inject-datomic :refer [inject-datomic-mw]]
    [middleware.cors :refer [cors-mw options-mw]]
    [middleware.auth :as auth-mw]
    [routes.metrics :as metrics]))

(def app
  (ring/ring-handler
   (ring/router
    ["/api/v1" [metrics/routes]]
    {:data {:muuntaja   m/instance
            :middleware [inject-datomic-mw
                         options-mw
                         cors-mw
                         params/wrap-params
                         muuntaja/format-middleware
                         auth-mw/verify-request]}})
   (ring/create-default-handler)))

(defn -main [& args]
  (println app)
  (println "This should pass the deploy check :)"))
