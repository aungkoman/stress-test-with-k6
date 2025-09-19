🏁 API Concurrent User Capacity Test Completed  source=console
INFO[0759] 📈 Check the results above to determine:       source=console
INFO[0759]    • Maximum concurrent users your API can handle  source=console
INFO[0759]    • Response time degradation patterns       source=console
INFO[0759]    • Error rate at different load levels      source=console
INFO[0759]    • Performance bottlenecks and capacity limits  source=console
INFO[0759]
============================================================  source=console
INFO[0759] 📊 CAPACITY TEST SUMMARY                       source=console
INFO[0759] ============================================================  source=console
INFO[0759] 🔢 Maximum Concurrent Users Tested: NaN        source=console
INFO[0759] ⏱️  Average Response Time: 28.69s             source=console
INFO[0759] ❌ Error Rate: 94.46%                          source=console
INFO[0759] 📈 Total Requests Processed: 6467              source=console
INFO[0759] ============================================================  source=console


-- 



D:\Cisco\Code\Workout\stress-test>k6 run --out json=results.json test.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/

     execution: local
        script: test.js
        output: json (results.json)

     scenarios: (100.00%) 1 scenario, 1000 max VUs, 3m30s max duration (incl. graceful stop):
              * default: Up to 1000 looping VUs for 3m0s over 4 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ TOTAL RESULTS

    HTTP
    http_req_duration..............: avg=43.41ms min=23.79ms med=27.25ms max=2.48s p(90)=41.86ms p(95)=59.94ms
      { expected_response:true }...: avg=43.41ms min=23.79ms med=27.25ms max=2.48s p(90)=41.86ms p(95)=59.94ms
    http_req_failed................: 0.00%  0 out of 69437
    http_reqs......................: 69437  384.272115/s

    EXECUTION
    iteration_duration.............: avg=1.04s   min=1.02s   med=1.02s   max=3.49s p(90)=1.04s   p(95)=1.06s
    iterations.....................: 69437  384.272115/s
    vus............................: 9      min=4          max=998
    vus_max........................: 1000   min=1000       max=1000

    NETWORK
    data_received..................: 677 MB 3.7 MB/s
    data_sent......................: 4.7 MB 26 kB/s




running (3m00.7s), 0000/1000 VUs, 69437 complete and 0 interrupted iterations
default ✓ [======================================] 0000/1000 VUs  3m0s

----


