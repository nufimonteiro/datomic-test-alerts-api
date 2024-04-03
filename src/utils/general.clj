(ns utils.general
  (:require [clojure.data.json :as json]
            [clj-http.client :as client]
            [cognitect.anomalies :as anomalies]
            [queries :as queries]
            [resources.vars :as vars]))

(def retryable-anomaly?
  "Set of retryable anomalies."
  #{::anomalies/busy
    ::anomalies/unavailable
    ::anomalies/interrupted})

(defn with-retry
  "Try op, return result if successful, if op throws, check exception against retry? pred,
  retrying if the predicate returns true. Optional backoff function controls retry wait. Backoff
  function should return msec backoff desired or nil to stop retry.
  Defaults to trying 10 times with linear backoff. "
  [op & {:keys [retry? backoff]
         :or   {retry?  (fn [e]
                          (-> e ex-data ::anomalies/category retryable-anomaly?))
                backoff (fn [epoch]
                          (when (<= epoch 10)
                            (* 200 epoch)))}}]
  (loop [epoch 1]
    (let [[success val] (try [true (op)]
                             (catch Exception e
                               [false e]))]
      (if success
        val
        (if-let [ms (and (retry? val) (backoff epoch))]
          (do
            (Thread/sleep ms)
            (recur (inc epoch)))
          (throw val))))))

(def current-month (.format (java.text.SimpleDateFormat. "MMMM") (new java.util.Date)))

(defn token-is-valid? [token db app]
  (let [token-valid (queries/get-token-app app db)]
    (true? (= token token-valid))))

(defn log-string-to-map [log]
  (read-string (re-find #"\{.*\}" log)))

(defn format-alert
  [time log-group log-name version message timestamp-start timestamp-end mensagem]
  (let [url-log-name (vars/url-link-log-stream log-group log-name timestamp-start timestamp-end)
        url-log-group (vars/url-link-log-group log-group)]
    (if (not= nil version)
      ("*An alert in the tests*:
  *_Time of the occurence_*: %s
  *_LogGroup_*: %s
  *_Logname_*: %s
  *_Datomic Version_*: %s
  *_Message from log_*: ```%s```
  *Complete message: *  ```%s```" format
              time url-log-group url-log-name version message mensagem)
      (format "*An alert in the tests*:
  *_Time of the occurence_*: %s
  *_LogGroup_*: %s
  *_Logname_*: %s
  *_Message from log_*: ```%s```
  *Complete message: * ```%s```"
              time url-log-group url-log-name message mensagem))))