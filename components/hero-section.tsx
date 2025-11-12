import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-[216px] pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Hero Content */}
          <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                Use crypto like money — we handle the rest.
                <br />
              </div>
              <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                Shop anywhere. Pay in crypto. We pay the merchant
                <br className="hidden sm:block" />
                No cards, no conversions, no friction.
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button className="h-12 px-12 bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full font-medium text-sm shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]">
              Pay with crypto
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
