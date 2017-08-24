/*  this is a fix for subscribe components when
 *  one of subscribers throw exceptions and terminate
 *  every subscription. we are usiing in Observable
 *  try/catch to to catch those exceptions
 *
 */

import { Observable } from "rxjs";


Observable.prototype.safeSubscribe = function(next, error, complete) {
  const sub = this.subscribe(
     item => {
       try {
         next(item);
       } catch (e) {
         console.error(e.stack || e);
         sub.unsubscribe();
       }
     },
     error,
     complete);
};
