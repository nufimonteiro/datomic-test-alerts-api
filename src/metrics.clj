(ns metrics
  (:require
    [clojure.string :as str]
    [resources.html :as html]
    [utils.general :as utils]))

(def token (System/getenv "TOKEN"))

(println "Generating your report...")
(def html (atom html/header-html))
(def index-ranking (atom 1))

;html report
(defn run [opts]
  (let [site-ids {:cognitect-com      1
                  :datomic-home       2
                  :datomic-cloud      3
                  :datomic-on-prem    4
                  :clojure-org        9
                  :clojure-script-org 10}]
    (doseq [[website id-website] site-ids]
      (let [full-data-api (utils/call-api id-website token)]
        (swap! html #(str % (html/title-website (str/replace website #":" ""))))
        (swap! html #(str % html/title-rows))
        (doseq [api-data (butlast full-data-api)]
          (let
            [label (:label api-data)
             sum_daily_nb_uniq_visitors (:sum_daily_nb_uniq_visitors api-data)]
            (swap! html #(str % (html/content-table @index-ranking label sum_daily_nb_uniq_visitors utils/current-month)))
            (swap! index-ranking inc)))
        (let [last-api-data (last full-data-api)]
          (when last-api-data
            (let
              [label (:label last-api-data)
               total-visits (:nb_visits last-api-data)
               sum_daily_nb_uniq_visitors (:sum_daily_nb_uniq_visitors last-api-data)]
              (swap! html #(str % (html/content-table @index-ranking label sum_daily_nb_uniq_visitors utils/current-month)))
              (swap! html #(str % "</table></div></div></div></div>"))
              (swap! html #(str % (html/div-total-visits total-visits sum_daily_nb_uniq_visitors)))
              (swap! index-ranking (fn [_] 1))))))))
  (swap! html #(str % html/footer))

  ;generate file
  (spit "report/report-matomo.html" @html)
  (println "Report generated in reports/report-matomo.html"))

