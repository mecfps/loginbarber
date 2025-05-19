import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-url", request.url)

  // Criar cliente do Supabase
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        requestHeaders.set("Set-Cookie", request.cookies.toString())
      },
      remove(name: string, options: any) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        requestHeaders.set("Set-Cookie", request.cookies.toString())
      },
    },
  })

  try {
    // Verificar sessão apenas uma vez
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Verificar se o usuário está autenticado para rotas protegidas
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Não verificamos o tenant_id aqui para evitar muitas chamadas
    }

    // Redirecionar usuários autenticados para a página inicial
    // Mas apenas se estiverem tentando acessar páginas de autenticação
    if (
      session &&
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/cadastro" ||
        request.nextUrl.pathname === "/esqueci-senha")
    ) {
      // Redirecionar para a página inicial em vez de tentar buscar o tenant
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Erro no middleware:", error)

    // Em caso de erro, permitir o acesso e deixar a página lidar com isso
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/cadastro", "/esqueci-senha"],
}
