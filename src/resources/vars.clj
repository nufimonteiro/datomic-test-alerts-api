(ns resources.vars
  (:require [clojure.string :as str]))
(def url-post-slack "https://slack.com/api/chat.postMessage")

(defn url-link-log-stream
  [log-group log-stream timestamp-start timestamp-end]
  (let [log-name (str/replace (str/replace log-stream #" " "%20") #"/" "%2F")]
   (str "<https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/" log-group "/log-events/" log-name "$3Fstart$3D" timestamp-start "$26end$3D" timestamp-end "|" (str/replace log-stream #" " "") ">")))

(defn url-link-log-group
  [log-group]
  (str " <https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/"log-group"|"log-group">"))