import http from "k6/http";
import { sleep } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 100 },  // ramp up to 100 users
    { duration: "1m", target: 500 },   // then increase to 500
    { duration: "30s", target: 1000 }, // push to 1000 users
    { duration: "1m", target: 0 },     // ramp down
  ],
};

export default function () {
  http.get("http://103.89.50.67");
  sleep(1);
}
