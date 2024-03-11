(ns local-server
  (:require
    [org.httpkit.server :as httpkit]
    [handler :refer [app]]))

(def default-state {:server nil})
(def state (atom default-state))

(defn run-server []
  (when-not (:server @state)
    (let [port 9898
          ;; run-server returns a function that stops the server
          stop-fn (httpkit/run-server #'app {:port port
                                            :max-body 100000000
                                            :join false})]
      (swap! state assoc :server stop-fn)
      (println "server started on port:" port))))

(defn stop-server []
  ((:server @state))
  (reset! state default-state))
(run-server)

(comment
  (stop-server))