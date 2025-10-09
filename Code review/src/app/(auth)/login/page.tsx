import { LoginForm } from '@/components/auth/login-form';
import Particles from '@/components/Particles';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A]">
      <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <div className="relative" style={{ zIndex: 100 }}>
        <LoginForm />
      </div>
    </div>
  );
}