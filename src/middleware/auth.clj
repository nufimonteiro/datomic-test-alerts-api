(ns middleware.auth
  (:require [utils.general :as utils]))

(def verify-request
  {:name    ::auth
   :summary "Verify authorization token"
   :wrap    (fn [handler]
              (fn [request]
                (let [routes (clojure.string/trim (get-in request [:reitit.core/match :template]))]
                  (if (or (not= nil (get (:headers request) "authorization")) (= routes "/api/v1/login"))
                    (do
                      (let [token (get (:headers request) "authorization")
                            db (get-in request [:datomic :db])]
                        (if (or (true? (utils/token-is-valid? token db)) (= routes "/api/v1/login"))
                          (handler request)
                          {:status 401 :body "Unauthorized. Token is incorrect."})))
                    {:status 401 :body "Unauthorized. You need to send Authorization in the header."}))))})