import StepGuide from '../components/StepGuide';

const HowToVote = () => {
  return (
    <main id="main-content" role="main" className="flex-1 bg-bg/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4">How to Cast Your Vote</h1>
        <p className="text-base md:text-lg text-muted max-w-2xl mx-auto">
          Follow this comprehensive step-by-step guide to ensure a smooth and successful voting experience on election day.
        </p>
      </div>
      
      <StepGuide />
    </main>
  );
};

export default HowToVote;
