import { getServerSession } from "next-auth"
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import config from "@app/api/auth/config";

export function getSession(
    ...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
  return getServerSession(...args, config);
}
