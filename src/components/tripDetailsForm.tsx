import { useForm } from 'react-hook-form';
import tentImg from '../assets/tent.jpg';
import hotelImg from '../assets/hotel.jpg';
import FormSectionHead from './formSectionHead';
import { useNavigate } from 'react-router';

export interface TripDetails {
  stayLength: number;
  type: 'tent' | 'hotel';
  timestamp: string;
}

const TripDetailsForm = (): JSX.Element => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<TripDetails>({
    defaultValues: {
      stayLength: 3,
      type: 'tent',
    },
  });

  const onSubmit = (formValues: TripDetails): void => {
    navigate('/gear-list', { state: { ...formValues, timestamp: Date.now().toString() } });
  };

  return (
    <>
      <FormSectionHead count={1} title="Zadej základní informace  " />
      <form
        className="flex flex-col justify-center sm:items-center gap-2 mb-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <label className="flex gap-3 items-center font-medium">
            Počet dní:
            <input
              defaultValue={3}
              min={1}
              className="p-1 w-20 bg-inputBg rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              type="number"
              {...register('stayLength', { required: true })}
            />
          </label>
          <label className="flex flex-col font-medium">
            <div className="mb-3">Typ výletu:</div>
            <div className="flex items-center gap-10">
              <label htmlFor="tent">
                <input
                  className="peer sr-only"
                  type="radio"
                  id="tent"
                  value="tent"
                  {...register('type', { required: true })}
                />
                <img
                  className="w-70 sm:w-40 md:w-52 cursor-pointer ring-transparent peer-checked:ring-accent rounded-3xl ring-offset-2 ring-4"
                  src={tentImg}
                  alt="camping"
                />
              </label>
              <div>
                <label htmlFor="hotel">
                  <input
                    className="sr-only peer"
                    type="radio"
                    id="hotel"
                    value="hotel"
                    {...register('type', { required: true })}
                  />
                  <img
                    className="w-70 sm:w-40 md:w-52 cursor-pointer ring-transparent peer-checked:ring-accent ring-offset-2 ring-4 rounded-3xl"
                    src={hotelImg}
                    alt="hotel"
                  />
                </label>
              </div>
            </div>
          </label>
        </div>
        <div className="flex justify-center">
          <button
            className="h-10 px-6 mt-4 font-semibold w-48 rounded-md bg-primary text-white my-3"
            type="submit"
          >
            Vytvořit seznam
          </button>
        </div>
      </form>
    </>
  );
};

export default TripDetailsForm;
