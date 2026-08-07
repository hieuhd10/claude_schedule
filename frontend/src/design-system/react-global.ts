import * as React from "react";

/**
 * The LIFT Tailux bundle is a UMD build that reads `React` off the global scope.
 * This module must be evaluated before the bundle, so it is imported first by
 * `lift-tailux.ts` and nowhere else.
 */
(globalThis as unknown as { React: typeof React }).React = React;
