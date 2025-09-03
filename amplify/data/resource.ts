import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  BedrockResponse: a.customType({
    body: a.string(),
    error: a.string(),
  }),

  askBedrock: a
    .query()
    .arguments({
      ingredients: a.string().array(),
    })
    .returns(a.ref("BedrockResponse"))
    // 👇 如果你要用 Cognito 登录保护 API
    .authorization((allow) => [allow.authenticated()])
    .handler(
      a.handler.custom({
        entry: "./bedrock.js",
        dataSource: "bedrockDS",
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // 如果你用登录保护，就改成下面：
    defaultAuthorizationMode: "userPool",

    // 如果要用 API Key 测试，就用这个（注意 askBedrock 的授权要改成 allow.public()）
    // defaultAuthorizationMode: "apiKey",
    // apiKeyAuthorizationMode: {
    //   expiresInDays: 30,
    // },
  },
});

