import { IncomingMessage, ServerResponse } from "http";
import contentSecurityPolicy, {
  ContentSecurityPolicyOptions,
} from "./middlewares/content-security-policy";
import crossOriginEmbedderPolicy from "./middlewares/cross-origin-embedder-policy";
import crossOriginOpenerPolicy, {
  CrossOriginOpenerPolicyOptions,
} from "./middlewares/cross-origin-opener-policy";
import crossOriginResourcePolicy, {
  CrossOriginResourcePolicyOptions,
} from "./middlewares/cross-origin-resource-policy";
import expectCt, { ExpectCtOptions } from "./middlewares/expect-ct";
import originAgentCluster from "./middlewares/origin-agent-cluster";
import referrerPolicy, {
  ReferrerPolicyOptions,
} from "./middlewares/referrer-policy";
import strictTransportSecurity, {
  StrictTransportSecurityOptions,
} from "./middlewares/strict-transport-security";
import xContentTypeOptions from "./middlewares/x-content-type-options";
import xDnsPrefetchControl, {
  XDnsPrefetchControlOptions,
} from "./middlewares/x-dns-prefetch-control";
import xDownloadOptions from "./middlewares/x-download-options";
import xFrameOptions, {
  XFrameOptionsOptions,
} from "./middlewares/x-frame-options";
import xPermittedCrossDomainPolicies, {
  XPermittedCrossDomainPoliciesOptions,
} from "./middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "./middlewares/x-powered-by";
import xXssProtection from "./middlewares/x-xss-protection";

interface HelmetOptions {
  contentSecurityPolicy?: ContentSecurityPolicyOptions | boolean;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicyOptions | boolean;
  crossOriginResourcePolicy?: CrossOriginResourcePolicyOptions | boolean;
  dnsPrefetchControl?: XDnsPrefetchControlOptions | boolean;
  expectCt?: ExpectCtOptions | boolean;
  frameguard?: XFrameOptionsOptions | boolean;
  hidePoweredBy?: boolean;
  hsts?: StrictTransportSecurityOptions | boolean;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesOptions | boolean;
  referrerPolicy?: ReferrerPolicyOptions | boolean;
  xssFilter?: boolean;
}

interface MiddlewareFunction {
  (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: Error) => void
  ): void;
}

interface Helmet {
  (options?: Readonly<HelmetOptions>): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => void;

  contentSecurityPolicy: typeof contentSecurityPolicy;
  crossOriginEmbedderPolicy: typeof crossOriginEmbedderPolicy;
  crossOriginOpenerPolicy: typeof crossOriginOpenerPolicy;
  crossOriginResourcePolicy: typeof crossOriginResourcePolicy;
  dnsPrefetchControl: typeof xDnsPrefetchControl;
  expectCt: typeof expectCt;
  frameguard: typeof xFrameOptions;
  hidePoweredBy: typeof xPoweredBy;
  hsts: typeof strictTransportSecurity;
  ieNoOpen: typeof xDownloadOptions;
  noSniff: typeof xContentTypeOptions;
  originAgentCluster: typeof originAgentCluster;
  permittedCrossDomainPolicies: typeof xPermittedCrossDomainPolicies;
  referrerPolicy: typeof referrerPolicy;
  xssFilter: typeof xXssProtection;

  featurePolicy: () => never;
  hpkp: () => never;
  noCache: () => never;
}

function getArgs<T>(
  option: undefined | boolean | Readonly<T>,
  middlewareConfig: Readonly<
    {
      enabledByDefault?: boolean;
    } & (
      | { takesOptions?: true }
      | {
          name: string;
          takesOptions: false;
        }
    )
  > = {}
): null | [] | [T] {
  const { enabledByDefault = true } = middlewareConfig;

  switch (option) {
    case undefined:
      return enabledByDefault ? [] : null;
    case false:
      return null;
    case true:
      return [];
    default:
      if (middlewareConfig.takesOptions === false) {
        console.warn(
          `${middlewareConfig.name} does not take options. ${
            enabledByDefault
              ? "Remove the property"
              : "Set the property to `true`"
          } to silence this warning.`
        );
        return [];
      } else {
        return [option];
      }
  }
}

function getMiddlewareFunctionsFromOptions(
  options: Readonly<HelmetOptions>
): MiddlewareFunction[] {
  const result: MiddlewareFunction[] = [];

  const contentSecurityPolicyArgs = getArgs(options.contentSecurityPolicy);
  if (contentSecurityPolicyArgs) {
    result.push(contentSecurityPolicy(...contentSecurityPolicyArgs));
  }

  const crossOriginEmbedderPolicyArgs = getArgs(
    options.crossOriginEmbedderPolicy,
    {
      name: "crossOriginEmbedderPolicy",
      takesOptions: false,
      enabledByDefault: false,
    }
  );
  if (crossOriginEmbedderPolicyArgs) {
    result.push(crossOriginEmbedderPolicy());
  }

  const crossOriginOpenerPolicyArgs = getArgs(options.crossOriginOpenerPolicy, {
    enabledByDefault: false,
  });
  if (crossOriginOpenerPolicyArgs) {
    result.push(crossOriginOpenerPolicy(...crossOriginOpenerPolicyArgs));
  }

  const crossOriginResourcePolicyArgs = getArgs(
    options.crossOriginResourcePolicy,
    { enabledByDefault: false }
  );
  if (crossOriginResourcePolicyArgs) {
    result.push(crossOriginResourcePolicy(...crossOriginResourcePolicyArgs));
  }

  const xDnsPrefetchControlArgs = getArgs(options.dnsPrefetchControl);
  if (xDnsPrefetchControlArgs) {
    result.push(xDnsPrefetchControl(...xDnsPrefetchControlArgs));
  }

  const expectCtArgs = getArgs(options.expectCt);
  if (expectCtArgs) {
    result.push(expectCt(...expectCtArgs));
  }

  const xFrameOptionsArgs = getArgs(options.frameguard);
  if (xFrameOptionsArgs) {
    result.push(xFrameOptions(...xFrameOptionsArgs));
  }

  const xPoweredByArgs = getArgs(options.hidePoweredBy, {
    name: "hidePoweredBy",
    takesOptions: false,
  });
  if (xPoweredByArgs) {
    result.push(xPoweredBy());
  }

  const strictTransportSecurityArgs = getArgs(options.hsts);
  if (strictTransportSecurityArgs) {
    result.push(strictTransportSecurity(...strictTransportSecurityArgs));
  }

  const xDownloadOptionsArgs = getArgs(options.ieNoOpen, {
    name: "ieNoOpen",
    takesOptions: false,
  });
  if (xDownloadOptionsArgs) {
    result.push(xDownloadOptions());
  }

  const xContentTypeOptionsArgs = getArgs(options.noSniff, {
    name: "noSniff",
    takesOptions: false,
  });
  if (xContentTypeOptionsArgs) {
    result.push(xContentTypeOptions());
  }

  const originAgentClusterArgs = getArgs(options.originAgentCluster, {
    name: "originAgentCluster",
    takesOptions: false,
    enabledByDefault: false,
  });
  if (originAgentClusterArgs) {
    result.push(originAgentCluster());
  }

  const xPermittedCrossDomainPoliciesArgs = getArgs(
    options.permittedCrossDomainPolicies
  );
  if (xPermittedCrossDomainPoliciesArgs) {
    result.push(
      xPermittedCrossDomainPolicies(...xPermittedCrossDomainPoliciesArgs)
    );
  }

  const referrerPolicyArgs = getArgs(options.referrerPolicy);
  if (referrerPolicyArgs) {
    result.push(referrerPolicy(...referrerPolicyArgs));
  }

  const xXssProtectionArgs = getArgs(options.xssFilter, {
    name: "xssFilter",
    takesOptions: false,
  });
  if (xXssProtectionArgs) {
    result.push(xXssProtection());
  }

  return result;
}

const helmet: Helmet = Object.assign(
  function helmet(options: Readonly<HelmetOptions> = {}) {
    if (options.constructor?.name === "IncomingMessage") {
      throw new Error(
        "It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`."
      );
    }

    const middlewareFunctions = getMiddlewareFunctionsFromOptions(options);

    return function helmetMiddleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: (err?: unknown) => void
    ): void {
      let middlewareIndex = 0;

      (function internalNext(err?: unknown) {
        if (err) {
          next(err);
          return;
        }

        const middlewareFunction = middlewareFunctions[middlewareIndex];
        if (middlewareFunction) {
          middlewareIndex++;
          middlewareFunction(req, res, internalNext);
        } else {
          next();
        }
      })();
    };
  },
  {
    contentSecurityPolicy,
    crossOriginEmbedderPolicy,
    crossOriginOpenerPolicy,
    crossOriginResourcePolicy,
    dnsPrefetchControl: xDnsPrefetchControl,
    expectCt,
    frameguard: xFrameOptions,
    hidePoweredBy: xPoweredBy,
    hsts: strictTransportSecurity,
    ieNoOpen: xDownloadOptions,
    noSniff: xContentTypeOptions,
    originAgentCluster,
    permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
    referrerPolicy,
    xssFilter: xXssProtection,
    featurePolicy() {
      throw new Error(
        "helmet.featurePolicy was removed because the Feature-Policy header is deprecated. If you still need this header, you can use the `feature-policy` module."
      );
    },
    hpkp() {
      throw new Error(
        "helmet.hpkp was removed because the header has been deprecated. If you still need this header, you can use the `hpkp` module. For more, see <https://github.com/helmetjs/helmet/issues/180>."
      );
    },
    noCache() {
      throw new Error(
        "helmet.noCache was removed. You can use the `nocache` module instead. For more, see <https://github.com/helmetjs/helmet/issues/215>."
      );
    },
  }
);

export = helmet;
