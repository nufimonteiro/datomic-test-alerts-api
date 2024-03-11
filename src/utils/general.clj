(ns utils.general
  (:require [clojure.data.json :as json]
            [clj-http.client :as client]
            [cognitect.anomalies :as anomalies]
            [queries :as queries]))

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

(defn token-is-valid? [token db]
  (let [token-valid (queries/search-password token db)]
    (true? (= token token-valid))))

(defn call-api-matomo
  "Get metrics from Matomo
  You need to pass: id-site token
  Optional: period and date.
  Period and date arguments will be used in the cases that we need to specify a date to show metrics.
  In the case that you don't pass the optional arguments will be showed the date from first day month to today."
  [& args]
  (let [[id-site token period date] (take 4 args)]
    (if (not= nil period)
      (json/read-str (:body (client/get (format "https://cognitect.matomo.cloud/?module=API&method=UserCountry.getCountry&idSite=%s&period=%s&date=%s&format=JSON&filter_limit=5&token_auth=%s" id-site period date token))) :key-fn keyword)
      (json/read-str (:body (client/get (format "https://cognitect.matomo.cloud/?module=API&method=UserCountry.getCountry&idSite=%s&period=month&date=today&format=JSON&filter_limit=5&token_auth=%s" id-site token))) :key-fn keyword))))
