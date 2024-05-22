(ns utils.general
  (:require [clojure.data.json :as json]
            [clj-http.client :as client]
            [cognitect.anomalies :as anomalies]
            [queries :as queries]
            [resources.vars :as vars]
            [clojure.instant :as inst]
            [clojure.string :as str]
            [datomic.client.api :as d]))

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

;temp function
;TODO decide what to do with this function. Do we will include version?
(defn format-alert
  [time log-group log-name version message timestamp-start timestamp-end]
  (let [url-log-name (vars/url-link-log-stream log-group log-name timestamp-start timestamp-end)
        url-log-group (vars/url-link-log-group log-group)]
    (if (not= nil version)
     (format "*An alert in the tests*:
  *_Time of the occurence_*: %s
  *_LogGroup_*: %s
  *_Logname_*: %s
  *_Datomic Version_*: %s
  *_Message from log_*: ```%s```"
             time url-log-group url-log-name version message)
     (format "*An alert in the tests*:
  *_Time of the occurence_*: %s
  *_LogGroup_*: %s
  *_Logname_*: %s
  *_Message from log_*: ```%s```"
             time url-log-group url-log-name message))))

(defn str-to-instant [timestamp-str]
  (inst/read-instant-timestamp timestamp-str))

(defn convert-month-to-number
  [month]
  (let [months vars/map-months
        month-from-log (keyword month)]
    (month-from-log months)))

(defn format-timestamp-to-instant
  [timestamp]
  (let [timestamp-splited (str/split timestamp #" ")
        month (convert-month-to-number (get timestamp-splited 1))
        day (get timestamp-splited 2)
        year (get timestamp-splited 3)
        hour (get timestamp-splited 4)
        instant (str year "-" month "-" day "T" hour)]
    (str-to-instant instant)))

(defn inserting-new-alert
  [timestamp log-group log-name message conn]
  (d/transact conn {:tx-data [{:alert/timestamp timestamp
                               :alert/loggroup  log-group
                               :alert/logname   log-name
                               :alert/message   message}]}))

(defn search-alert-by-timestamp
  [timestamp db]
  (first (d/q '[:find ?timestamp ?loggroup ?logname ?message
          :in $ ?target-timestamp
          :where
          [?time :alert/timestamp ?timestamp]
          [?time :alert/message ?message]
          [?time :alert/loggroup ?loggroup]
          [?time :alert/logname ?logname]
          [?time :alert/message ?message]
          [(= ?timestamp ?target-timestamp)]] db timestamp)))

(defn alert-formated
  [alert]
  (zipmap [:timestamp :log-name :log-group :message] alert))

(defn format-alert-message
  [time log-group log-name message timestamp-start timestamp-end conn]
  (let [url-log-name (vars/url-link-log-stream log-group log-name timestamp-start timestamp-end)
        url-log-group (vars/url-link-log-group log-group)]
    (inserting-new-alert (format-timestamp-to-instant time) log-group log-name message conn)
    (format "*An alert in the tests*:
  *_Time of the occurence_*: %s
  *_LogGroup_*: %s
  *_Logname_*: %s
  *_Message from log_*: ```%s```"
            time url-log-group url-log-name message)))
