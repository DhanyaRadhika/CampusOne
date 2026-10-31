import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Users, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AuthPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your CampusOne portal
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <LoginCard
                  role="Student"
                  roleKey="student"
                  icon={GraduationCap}
                  onLogin={login}
                  isLoading={isLoading}
                  demoCreds="student@college.edu"
                  demoPassword="test123"
                />
              </TabsContent>

              <TabsContent value="faculty">
                <LoginCard
                  role="Faculty"
                  roleKey="faculty"
                  icon={Users}
                  onLogin={login}
                  isLoading={isLoading}
                  demoCreds="sravani@gmail.com"
                  demoPassword="sravs12"
                />
              </TabsContent>

              <TabsContent value="admin">
                <LoginCard
                  role="Admin"
                  roleKey="admin"
                  icon={ShieldCheck}
                  onLogin={login}
                  isLoading={isLoading}
                  demoCreds="admin@college.edu"
                  demoPassword="password"
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="signup">
            <SignUpCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginCard({
  role,
  roleKey,
  icon: Icon,
  onLogin,
  isLoading,
  demoCreds,
  demoPassword,
}: any) {
  const handleLogin = () => {
    const emailInput = document.querySelector(
      `input[data-role="${roleKey}"][type="email"]`
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      `input[data-role="${roleKey}"][type="password"]`
    ) as HTMLInputElement;

    const email =
      emailInput?.value ||
      (document.getElementById("email") as HTMLInputElement)?.value;
    const password =
      passwordInput?.value ||
      (document.getElementById("password") as HTMLInputElement)?.value;

    if (email && password) {
      onLogin(email, password);
    } else {
      alert("Please enter both email and password");
    }
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>{role} Login</CardTitle>
        </div>
        <CardDescription>
          Enter your credentials to access the {role.toLowerCase()} dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`email-${roleKey}`}>Email</Label>
          <Input
            id={`email-${roleKey}`}
            data-role={roleKey}
            type="email"
            placeholder="name@college.edu"
            defaultValue={demoCreds}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`password-${roleKey}`}>Password</Label>
          <Input
            id={`password-${roleKey}`}
            data-role={roleKey}
            type="password"
            defaultValue={demoPassword || "password123"}
          />
        </div>
        <Button
          className="w-full font-bold"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign In as {role}
        </Button>
        <div className="text-xs text-center text-muted-foreground mt-4">
          Demo Mode: Just click Sign In
        </div>
        <div className="text-xs text-center mt-2">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              const tabs = document.querySelector('[role="tablist"]');
              const forgotTab = tabs?.querySelector(
                '[value="forgot-password"]'
              ) as HTMLElement;
              forgotTab?.click();
            }}
          >
            Forgot Password?
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function SignUpCard() {
  const { signup, isLoading } = useAuth();
  const [signRole, setSignRole] = useState<"student" | "faculty" | "admin">(
    "student"
  );

  const handleSignUp = async () => {
    const name = (document.getElementById("signup-name") as HTMLInputElement)
      ?.value;
    const email = (document.getElementById("signup-email") as HTMLInputElement)
      ?.value;
    const role = signRole;
    const branch = (
      document.getElementById("signup-branch") as HTMLSelectElement
    )?.value;
    const year = (document.getElementById("signup-year") as HTMLSelectElement)
      ?.value;
    const department = (
      document.getElementById("signup-department") as HTMLInputElement
    )?.value;
    const employeeId = (
      document.getElementById("signup-employeeId") as HTMLInputElement
    )?.value;
    const office = (
      document.getElementById("signup-office") as HTMLInputElement
    )?.value;
    const password = (
      document.getElementById("signup-password") as HTMLInputElement
    )?.value;
    const skills = (
      document.getElementById("signup-skills") as HTMLInputElement
    )?.value;
    const cgpa = (document.getElementById("signup-cgpa") as HTMLInputElement)
      ?.value;

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name || !email || !role || !password) {
      alert("Please fill in all required fields");
      return;
    }

    // Role-specific required fields
    // Allow signup without CGPA to avoid blocking student registrations.

    if (role === "faculty" && (!department || !employeeId)) {
      alert("Faculty must provide Department and Employee ID");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      alert("Invalid email format. Please use a valid email address.");
      return;
    }

    // Lowercase email to match backend normalization
    const normalizedEmail = email.trim().toLowerCase();

    const payload = {
      name,
      email: normalizedEmail,
      password,
      role,
      branch: branch || undefined,
      year: year ? parseInt(year) : undefined,
      skills: skills ? skills.split(",").map((s) => s.trim()) : [],
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      department: department || undefined,
      employeeId: employeeId || undefined,
      office: office || undefined,
    };

    console.log("Sign up payload:", payload);

    await signup(payload);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle>Sign Up</CardTitle>
        </div>
        <CardDescription>
          Create your account to access the CampusOne portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input id="signup-name" placeholder="Enter your full name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@college.edu"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-role">Role</Label>
          <select
            id="signup-role"
            className="w-full px-3 py-2 border rounded-md"
            required
            value={signRole}
            onChange={(e) => setSignRole(e.target.value as any)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {signRole === "student" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="signup-branch">Branch</Label>
              <select
                id="signup-branch"
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Branch</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="ME">Mechanical (ME)</option>
                <option value="CE">Civil (CE)</option>
                <option value="EEE">Electrical (EEE)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-year">Year</Label>
              <select
                id="signup-year"
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-skills">Skills (comma-separated)</Label>
              <Input
                id="signup-skills"
                placeholder="e.g. React, Python, Data Structures"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-cgpa">CGPA</Label>
              <Input
                id="signup-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.5"
              />
            </div>
          </>
        )}
        {/* Faculty-specific fields */}
        {signRole === "faculty" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="signup-department">Department</Label>
              <Input
                id="signup-department"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-employeeId">Employee ID</Label>
              <Input id="signup-employeeId" placeholder="e.g. FAC-1234" />
            </div>
          </>
        )}

        {/* Admin-specific field */}
        {signRole === "admin" && (
          <div className="space-y-2">
            <Label htmlFor="signup-office">Office / Department</Label>
            <Input id="signup-office" placeholder="e.g. Admin Office" />
          </div>
        )}
        {/* moved student-only fields above */}
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            required
          />
        </div>
        <Button
          className="w-full font-bold"
          onClick={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign Up
        </Button>
      </CardContent>
    </Card>
  );
}

function ForgotPasswordCard() {
  const { forgotPassword, isLoading } = useAuth();

  const handleForgotPassword = async () => {
    const email = (document.getElementById("forgot-email") as HTMLInputElement)
      ?.value;

    if (!email) {
      alert("Please enter your email address");
      return;
    }

    await forgotPassword(email);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>Forgot Password</CardTitle>
        </div>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="name@college.edu"
            required
          />
        </div>
        <Button
          className="w-full font-bold"
          onClick={handleForgotPassword}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </CardContent>
    </Card>
  );
}
